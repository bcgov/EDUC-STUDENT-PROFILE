import { LocalDateTime } from '@js-joda/core';
import lodash from 'lodash';
import HttpStatus from 'http-status-codes';
import jsonwebtoken from 'jsonwebtoken';
import {
  getSessionUser,
  getAccessToken,
  deleteData,
  getData,
  postData,
  RequestStatuses,
  VerificationResults,
  EmailVerificationStatuses,
  RequestApps,
  formatCommentTimestamp,
  getStudent,
  getDefaultBcscInput
} from './utils.js';
import { postRequest, getDigitalIdData, getLatestRequest } from './request.js';
import { getServerSideCodes } from './identityTypeCodes.js';
import { getApiCredentials } from './auth.js';
import config from '../config/index.js';
import log from './logger.js';
import * as redisUtil from '../util/redis/redis-utils.js';
import { ServiceError, ConflictStateError } from './error.js';
import { setPenRequestReplicateStatus } from './penRequest.js';
import { setStudentRequestReplicateStatus } from './studentRequest.js';
import { sendVerificationEmail } from './email.js';
import { updateRequestStatus } from './requestStatus.js';

export function verifyRequest(requestType) {
  return function getRequestHandler(req, res, next) {
    const userInfo = getSessionUser(req);
    if(!userInfo) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'you are not authorized to access this page'
      });
    }

    const requestID = req.params.id;
    const sessionRequestType = req?.session?.[requestType];
    if(!sessionRequestType || sessionRequestType?.[`${requestType}ID`] !== requestID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Wrong requestID'
      });
    }

    next();
  };
}

export function verifyDocumentId(requestType) {
  return function verifyDocumentIdHandler(req, res, next) {
    const userInfo = getSessionUser(req);
    if(!userInfo) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: 'you are not authorized to access this page'
      });
    }

    const documentID = req.params.documentId;
    const reqSessionDocumentIds = req?.session?.[`${requestType}DocumentIDs`] || [];
    if (!reqSessionDocumentIds.includes(documentID)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'documentID not found in session'
      });
    }

    next();
  };
}

export function verifyPostCommentRequest(requestType) {
  return function getRequestHandler(req, res, next) {
    const userInfo = getSessionUser(req);
    if(!userInfo?._json?.digitalIdentityID){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }
    const requestID = req.params.id;
    const sessionRequestType = req?.session?.[requestType];
    if(!sessionRequestType
      || sessionRequestType?.[`${requestType}ID`] !== requestID
      || sessionRequestType?.[`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: `Post ${requestType} comment not allowed`
      });
    }
    req.userInfo = userInfo;
    req.accessToken = accessToken;

    next();
  };
}

export async function getUserInfo(req, res) {
  const userInfo = getSessionUser(req);
  const correlationID = req.session?.correlationID;
  if(!userInfo?.jwt || !userInfo?._json?.digitalIdentityID) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No session data'
    });
  }

  const accessToken = userInfo.jwt;
  const digitalID = userInfo._json.digitalIdentityID;

  try {
    const [digitalIdData, codesData, penRequest, studentRequest] = await Promise.all([
      getDigitalIdData(accessToken, digitalID, correlationID),
      getServerSideCodes(accessToken, correlationID),
      getLatestRequest(accessToken, digitalID, 'penRequest', setPenRequestReplicateStatus, correlationID),
      getLatestRequest(accessToken, digitalID, 'studentRequest', setStudentRequestReplicateStatus, correlationID),
    ]);

    const identityType = lodash.find(codesData.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]);

    if (!identityType) {
      log.error('getIdentityType Error identityTypeCode', digitalIdData.identityTypeCode);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Wrong identityTypeCode'
      });
    }

    let student = null;

    if(userInfo?._json?.studentID) {
      student = getStudent(userInfo);
    }

    if (req?.session) {
      req.session.digitalIdentityData = digitalIdData;
      req.session.digitalIdentityData.identityTypeLabel = identityType.label;
      req.session.studentRequest = studentRequest;
      req.session.penRequest = penRequest;
    } else {
      throw new ServiceError('userInfo error: session does not exist');
    }

    let resData = {
      displayName: userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      identityTypeLabel: identityType.label,
      ...(userInfo._json.accountType === 'BCSC' ? getDefaultBcscInput(userInfo) : {}),
      studentRequest,
      penRequest,
      student,
    };

    return res.status(HttpStatus.OK).json(resData);
  } catch (e) {
    log.error('getUserInfo Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Get userInfo error',
      errorSource: e.errorSource
    });
  }
}

export function getCodes(requestType) {
  return async function getCodesHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }
      const correlationID = req.session?.correlationID;
      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const codeUrls = [
        `${endpoint}/statuses`,
      ];

      let [statusCodes] = await Promise.all(codeUrls.map(url => getData(accessToken, url, correlationID)));
      return res.status(HttpStatus.OK).json({statusCodes});
    } catch (e) {
      log.error('getCodes Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Get codes error'
      });
    }
  };
}

export function submitRequest(requestType, verifyRequestStatus) {
  return async function submitRequestHandler(req, res) {
    try{
      const userInfo = getSessionUser(req);
      if(!userInfo) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No session data'
        });
      }

      const accessToken = userInfo.jwt;

      if (req?.session?.[requestType] && verifyRequestStatus(req)) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Submit ${requestType} not allowed`
        });
      }

      //attach documents
      const documentIds = req?.session?.[`${requestType}DocumentIDs`] || [];
      if (documentIds.length > 0 && req.body?.documentIDs) {
        req.body.documentIDs = req.body.documentIDs.filter(documentID => req.session[`${requestType}DocumentIDs`].includes(documentID));
      }

      const correlationID = req.session?.correlationID;

      const resData = await postRequest(accessToken, req.body, userInfo._json, requestType, correlationID);

      req.session[requestType] = resData;
      //clear documentIDs in session
      req.session[`${requestType}DocumentIDs`] && (req.session[`${requestType}DocumentIDs`] = null);
      if(req.body.email && req.body.email !== req.body.recordedEmail) {
        sendVerificationEmail(accessToken, req.body.email, resData[`${requestType}ID`], req.session.digitalIdentityData.identityTypeLabel, requestType, correlationID).catch(e =>
          log.error('sendVerificationEmail Error', e.stack)
        );
      }

      return res.status(HttpStatus.OK).json(resData);
    } catch(e) {
      log.error('submitRequest Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Submit ${requestType} error`,
        errorSource: e.errorSource
      });
    }
  };
}

export function postComment(requestType, createCommentPayload, createCommentEvent, correlationID) {
  return async function postCommentHandler(req, res) {
    try{
      const userInfo = req.userInfo;
      const accessToken = req.accessToken;
      const url = config.get('profileSagaAPIURL') + config.get(`${requestType}:commentSagaEndpoint`);
      const payload = createCommentPayload(req.params.id, req.body.content);
      const sagaId = await postData(accessToken, payload, url, correlationID);
      const event = createCommentEvent(sagaId, req.params.id, userInfo._json.digitalIdentityID);

      log.info(`going to store event object in redis for ${requestType} comment saga :: `, event);
      await redisUtil.createProfileRequestSagaRecordInRedis(event);
      return res.status(HttpStatus.OK).json();
    } catch(e) {
      log.error('postComment Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Post ${requestType} comment error`
      });
    }
  };
}

export function getComments(requestType) {
  return async function getCommentsHandler(req, res) {
    try {
      const userInfo = getSessionUser(req);
      if(!userInfo) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No session data'
        });
      }

      const accessToken = userInfo.jwt;
      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const url = `${endpoint}/${req.params.id}/comments`;
      const apiResData = await getData(accessToken, url, req.session?.correlationID);

      let response = {
        participants: [],
        myself: {
          name: userInfo._json.displayName,
          id: '1'
        },
        messages: []
      };
      apiResData.sort((a,b) => {
        if (a.commentTimestamp > b.commentTimestamp) return 1;
        if (b.commentTimestamp > a.commentTimestamp) return -1;
        return 0;
      });

      apiResData.forEach(element => {
        const participant = {
          name: (element.staffMemberName ? element.staffMemberName : 'Student'),
          id: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1')
        };

        /** @type {String} */
        const participantId = participant?.id || '';
        if (participantId.toUpperCase() !== response.myself.id.toUpperCase()) {
          const index = response.participants.findIndex((e) => e.id === participant.id);

          if (index === -1) {
            response.participants.push(participant);
          }
        }

        response.messages.push({
          content: element.commentContent,
          participantId: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1'),
          myself: participant.id.toUpperCase() === response.myself.id.toUpperCase(),
          timestamp: element.commentTimestamp,
          readableTime: formatCommentTimestamp(element.commentTimestamp)
        });
      });

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      log.error('getComments Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `${requestType} Comments Get error`
      });
    }
  };
}

export function beforeUpdateRequestAsInitrev(request, requestType) {
  if(request[`${requestType}StatusCode`] !== RequestStatuses.DRAFT) {
    throw new ConflictStateError(`Current ${requestType} Status: ` + request[`${requestType}StatusCode`]);
  }

  if(request.emailVerified !== EmailVerificationStatuses.NOT_VERIFIED) {
    throw new ConflictStateError(`Current ${requestType} Email Verification Status: ` + request.emailVerified);
  }

  request.initialSubmitDate = LocalDateTime.now().toString();
  request.emailVerified = EmailVerificationStatuses.VERIFIED;

  return request;
}

export async function setRequestAsInitrev(requestID, requestType, correlationID) {
  let data = await getApiCredentials(config.get('oidc:clientId'), config.get('oidc:clientSecret'));
  const accessToken = data.accessToken;

  return updateRequestStatus(accessToken, requestID, RequestStatuses.INITREV, requestType, beforeUpdateRequestAsInitrev, correlationID);
}

export function verifyEmailToken(token) {
  try {
    const tokenPayload = jsonwebtoken.verify(token, config.get('email:secretKey'));
    if(tokenPayload.SCOPE !== 'VERIFY_EMAIL') {
      log.error('verifyEmailToken Error', `Invalid SCOPE: ${tokenPayload.SCOPE}`);
      return [{name: 'JsonWebTokenError'}, null];
    }

    if (!tokenPayload.jti) {
      log.error('verifyEmailToken Error', 'Invalid Request ID');
      return [{name: 'JsonWebTokenError'}, null];
    }

    return [null, tokenPayload.jti];
  } catch(e) {
    log.error('verifyEmailToken Err', e.stack);
    return [e, null];
  }
}

export function verifyEmail(requestType) {
  return async function verifyEmailHandler(req, res) {
    const loggedin = getSessionUser(req);
    const baseUrl = config.get('server:frontend');
    const appUrl = `${baseUrl}/${RequestApps[requestType]}`;
    const verificationUrl = `${baseUrl}/${RequestApps[requestType]}/verification/`;

    if (!req.query.verificationToken) {
      return res.redirect(verificationUrl + VerificationResults.TOKEN_ERROR);
    }

    try {
      const [error, requestID] = verifyEmailToken(req.query.verificationToken);
      if (error && error.name === 'TokenExpiredError') {
        return res.redirect(loggedin ? appUrl : (verificationUrl + VerificationResults.EXPIRED));
      } else if (error) {
        return res.redirect(verificationUrl + VerificationResults.TOKEN_ERROR);
      }

      const data = await setRequestAsInitrev(requestID, requestType, req.session?.correlationID);
      if(loggedin) {
        req.session[requestType] = data;
      }

      return res.redirect(loggedin ? appUrl : (verificationUrl + VerificationResults.OK));
    } catch(e) {
      if (e instanceof ConflictStateError) {
        return res.redirect(loggedin ? appUrl : (verificationUrl + VerificationResults.OK));
      } else {
        log.error('verifyEmail Error', e.stack);
        return res.redirect(verificationUrl + VerificationResults.SERVER_ERROR);
      }
    }
  };
}

export function beforeUpdateRequestAsSubsrev(request, requestType) {
  if (request[`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
    throw new ConflictStateError(`Current ${requestType} Status: ` + request[`${requestType}StatusCode`]);
  }

  return request;
}

export function setRequestAsSubsrev(requestType) {
  return async function setRequestAsSubsrevHandler(req, res) {
    try {
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      const requestID = req.params.id;
      const requestStatus = req.body[`${requestType}StatusCode`];

      if (!requestStatus) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `No ${requestType}StatusCode data`
        });
      }

      if(requestStatus !== RequestStatuses.SUBSREV) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Wrong ${requestType}StatusCode`
        });
      }

      let data = await updateRequestStatus(accessToken, requestID, requestStatus, requestType, beforeUpdateRequestAsSubsrev);
      req.session[requestType] = data;

      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('setRequestAsSubsrev Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Set ${requestType} as subsrev error`,
        errorSource: e.errorSource
      });
    }
  };
}

export function resendVerificationEmail(requestType) {
  return async function resendVerificationEmailHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      if(req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.DRAFT) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Resend ${requestType} verification email not allowed`
        });
      }

      const data = await sendVerificationEmail(accessToken, req.session[requestType].email, req.session[requestType][`${requestType}ID`],
        req.session.digitalIdentityData.identityTypeLabel, requestType);

      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('resendVerificationEmail Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Resend ${requestType} verification email error`,
        errorSource: e.errorSource
      });
    }
  };
}

export function uploadFile(requestType) {
  return async function uploadFileHandler(req, res) {
    try {
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      if (!req.session[requestType] || req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Upload ${requestType} file not allowed`
        });
      }

      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const url = `${endpoint}/${req.params.id}/documents`;

      const data = await postData(accessToken, req.body, url, req.session?.correlationID);
      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('uploadFile Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Upload ${requestType} file error`
      });
    }
  };
}

export function uploadFileWithoutRequest(requestType) {
  return async function uploadFileHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      if(req.session[requestType] && [RequestStatuses.DRAFT, RequestStatuses.INITREV, RequestStatuses.RETURNED, RequestStatuses.SUBSREV].includes(req.session[requestType][`${requestType}StatusCode`])) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Upload ${requestType} file with request not allowed`
        });
      }

      const endpoint = config.get(`${requestType}:apiEndpoint`);
      const url = `${endpoint}/documents`;

      const data = await postData(accessToken, req.body, url, req.session?.correlationID);

      //save documentID to session
      req.session[`${requestType}DocumentIDs`] = (req.session[`${requestType}DocumentIDs`] || []).concat(data.documentID);

      return res.status(HttpStatus.OK).json(data);
    } catch(e) {
      log.error('uploadFileWithoutRequest Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Upload ${requestType} file error`
      });
    }
  };
}

export async function getDocument(token, requestID, documentID, requestType, includeDocData = 'Y') {
  try {
    const endpoint = config.get(`${requestType}:apiEndpoint`);
    let url;
    if (requestID) {
      url = `${endpoint}/${requestID}/documents/${documentID}?includeDocData=${includeDocData}`;
    } else {
      url = `${endpoint}/documents/${documentID}?includeDocData=${includeDocData}`;
    }
    return await getData(token, url);
  } catch (e) {
    throw new ServiceError('getDocument error', e);
  }
}

export function deleteDocument(requestType) {
  return async function deleteDocumentHandler(req, res) {
    try {
      const accessToken = getAccessToken(req);
      if (!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      let resData = await getDocument(accessToken, req.params.id, req.params.documentId, requestType, 'N');

      if(req.params.id && (!req.session[requestType] || resData.createDate <= req.session[requestType].statusUpdateDate ||
        req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.RETURNED)) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Delete ${requestType} file not allowed`
        });
      }

      const endpoint = config.get(`${requestType}:apiEndpoint`);
      let url;
      if (req.params.id) {
        url = `${endpoint}/${req.params.id}/documents/${req.params.documentId}`;
      } else {
        url = `${endpoint}/documents/${req.params.documentId}`;
      }

      await deleteData(accessToken, url);
      return res.status(HttpStatus.OK).json();
    } catch (e) {
      log.error('deleteDocument Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Delete ${requestType} document error`,
        errorSource: e.errorSource
      });
    }
  };
}

export function downloadFile(requestType) {
  return async function downloadFileHandler(req, res) {
    try{
      const accessToken = getAccessToken(req);
      if(!accessToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'No access token'
        });
      }

      let resData = await getDocument(accessToken, req.params.id, req.params.documentId, requestType, 'Y');

      res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName?.replace(/ /g, '_').replace(/,/g, '_').trim());
      res.setHeader('Content-type', resData.fileExtension);

      return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
    } catch (e) {
      log.error('downloadFile Error', e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: `Download ${requestType} file error`,
        errorSource: e.errorSource
      });
    }
  };
}
