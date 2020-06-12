'use strict';

const { getSessionUser, getAccessToken, deleteData, getDataWithParams, getData, postData, putData, RequestStatuses, VerificationResults, EmailVerificationStatuses, generateJWTToken } = require('./utils');
const { getApiCredentials } = require('./auth');
const config = require('../config/index');
const log = require('npmlog');
const lodash = require('lodash');
const HttpStatus = require('http-status-codes');
const jsonwebtoken = require('jsonwebtoken');
const localDateTime = require('@js-joda/core').LocalDateTime;
const ChronoUnit = require('@js-joda/core').ChronoUnit;
const { ServiceError, ConflictStateError } = require('./error'); 

let codes = null;

function getRequest(req, res, next) {
  const userInfo = getSessionUser(req);
  if(!userInfo) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: 'you are not authorized to access this page'
    });
  }

  const requestID = req.params.id;
  if(!req || !req.session || !req.session.request || req.session.request.studentRequestID !== requestID) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Wrong requestID'
    });
  }

  next();
}

async function getDigitalIdData(token, digitalID) {
  try {
    return await getData(token, config.get('digitalID:apiEndpoint') + `/${digitalID}`);
  } catch (e) {
    throw new ServiceError('getDigitalIdData error', e);
  }
}

async function getStudent(token, studentID, sexCodes) {
  let student;
  try {
    student = await getData(token, config.get('student:apiEndpoint') + `/${studentID}`);
  } catch (e) {
    throw new ServiceError('getStudent error', e);
  }
  const sexInfo = lodash.find(sexCodes, ['sexCode', student.sexCode]);
  if(!sexInfo) {
    throw new ServiceError(`Wrong sexCode: ${student.sexCode}`);
  }
  student.sexLabel = sexInfo.label;
  return student;
}

async function getLatestRequest(token, digitalID) {
  let request = null;
  try {
    let data = await getData(token, `${config.get('studentProfile:apiEndpoint')}/?digitalID=${digitalID}`);
    request = lodash.maxBy(data, 'statusUpdateDate') || null;
    if(request) {
      request.digitalID = null;
      if (request.studentRequestStatusCode === RequestStatuses.COMPLETED) {
        const updateTime = localDateTime.parse(request.statusUpdateDate);
        let replicateTime = updateTime.truncatedTo(ChronoUnit.HOURS).withHour(config.get('studentProfile:replicateTime'));
        if (config.get('studentProfile:replicateTime') <= updateTime.hour()) {
          replicateTime = replicateTime.plusDays(1);
        }
        request.tomorrow = replicateTime.isAfter(localDateTime.now());
      }
    }
  } catch(e) {
    if(!e.status || e.status !== HttpStatus.NOT_FOUND) {
      throw new ServiceError('getLatestRequest error', e);
    }
  }

  return request;
}

function getDefaultBcscInput(userInfo) {
  let givenArray = (userInfo._json.givenNames).split(' ');
  givenArray.shift();
  let middleNames = givenArray.join(' ');
  return {
    legalLastName: userInfo._json.surname,
    legalFirstName: userInfo._json.givenName,
    legalMiddleNames: middleNames,
    gender: userInfo._json.gender,
    email: userInfo._json.email,
    dob: userInfo._json.birthDate
  };
}

async function getUserInfo(req, res) {
  const userInfo = getSessionUser(req);
  if(!userInfo || !userInfo.jwt || !userInfo._json || !userInfo._json.digitalIdentityID) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'No session data'
    });
  }
  
  const accessToken = userInfo.jwt;
  const digitalID = userInfo._json.digitalIdentityID;

  return Promise.all([
    getDigitalIdData(accessToken, digitalID), 
    getServerSideCodes(accessToken), 
    getLatestRequest(accessToken, digitalID)
  ]).then(async ([digitalIdData, codes, request]) => {
  
    const identityType = lodash.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]);
    if(! identityType) {
      log.error('getIdentityType Error identityTypeCode', digitalIdData.identityTypeCode);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Wrong identityTypeCode'
      });
    }

    let student = null;
    if(digitalIdData.studentID) {
      student = await getStudent(accessToken, digitalIdData.studentID, codes.sexCodes);
    }

    if(req && req.session){
      req.session.digitalIdentityData = digitalIdData;
      req.session.digitalIdentityData.identityTypeLabel = identityType.label;
      req.session.request = request;
    } else {
      throw new ServiceError('userInfo error: session does not exist');
    }
    let resData = {
      displayName: userInfo._json.displayName,
      accountType: userInfo._json.accountType,
      identityTypeLabel: identityType.label,
      ...(userInfo._json.accountType === 'BCSC' ? getDefaultBcscInput(userInfo) : {}),
      request,
      student,
    };

    return res.status(HttpStatus.OK).json(resData);
  }).catch(e => {
    log.error('getUserInfo Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Get userInfo error',
      errorSource: e.errorSource
    });
  });
}

async function getCodes(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const codeUrls = [
      `${config.get('studentProfile:apiEndpoint')}/gender-codes`, 
      `${config.get('studentProfile:apiEndpoint')}/statuses`,
    ];

    const [genderCodes, statusCodes] = await Promise.all(codeUrls.map(url => getData(accessToken, url)));
    if(genderCodes){
      // forcing sort if API did not return in sorted order.
      genderCodes.sort((a,b)=> a.displayOrder - b.displayOrder);
    }
    return res.status(HttpStatus.OK).json({genderCodes, statusCodes});
  } catch (e) {
    log.error('getCodes Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Get codes error'
    });
  }
}

async function getServerSideCodes(accessToken) {
  if(!codes) {
    try{
      const codeUrls = [
        `${config.get('student:apiEndpoint')}/sex-codes`,
        `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`
      ];

      const [sexCodes, identityTypes] = await Promise.all(codeUrls.map(url => getData(accessToken, url)));
      codes = {sexCodes, identityTypes};
    } catch(e) {
      throw new ServiceError('getServerSideCodes error', e);
    }
  }
  return codes;
}

async function sendVerificationEmail(accessToken, emailAddress, requestId, identityTypeLabel) {
  const verificationUrl = config.get('server:frontend') + '/api/student/verification?verificationToken';
  const reqData = {
    emailAddress,
    requestId,
    identityTypeLabel,
    verificationUrl: verificationUrl
  };
  const url = config.get('email:apiEndpoint') + '/verify';
  try {
    const payload = {
      SCOPE: 'VERIFY_EMAIL'
    };
    reqData.jwtToken = await generateJWTToken(requestId, emailAddress, 'VerifyEmailAPI', 'HS256', payload);
    return await postData(accessToken, reqData, url);
  } catch (e) {
    throw new ServiceError('sendVerificationEmail error', e);
  }
}

async function getAutoMatchResults(accessToken, userInfo) {
  try {
    const url = config.get('demographics:apiEndpoint');

    let params = {
      params: {
        studSurName: userInfo['surname'],
        studGiven: userInfo['givenName'],
        studMiddle: userInfo['givenNames'] && userInfo['givenNames'].replace(userInfo['givenName'],'').trim(),
        studBirth: userInfo['birthDate'] && userInfo['birthDate'].split('-').join(''),
        studSex: userInfo['gender'] && userInfo['gender'].charAt(0)
      }
    };

    const autoMatchResults = await getDataWithParams(accessToken, url, params);
    let bcscAutoMatchOutcome;
    let bcscAutoMatchDetails;
    if(autoMatchResults.length < 1) {
      bcscAutoMatchOutcome = 'ZEROMATCHES';
      bcscAutoMatchDetails = 'Zero PEN records found by BCSC auto-match';
    }
    else if(autoMatchResults.length > 1) {
      bcscAutoMatchOutcome = 'MANYMATCHES';
      bcscAutoMatchDetails = autoMatchResults.length + ' PEN records found by BCSC auto-match';
    }
    else {
      bcscAutoMatchOutcome = 'ONEMATCH';
      const lastName = autoMatchResults[0]['studSurname'] ? autoMatchResults[0]['studSurname'] : '(none)';
      const firstName = autoMatchResults[0]['studGiven'] ? autoMatchResults[0]['studGiven'] : '(none)';
      const middleName = autoMatchResults[0]['studMiddle'] ? autoMatchResults[0]['studMiddle'] : '(none)';
      bcscAutoMatchDetails = `${autoMatchResults[0].pen} ${lastName}, ${firstName}, ${middleName}`;
    }

    return {
      bcscAutoMatchOutcome: bcscAutoMatchOutcome,
      bcscAutoMatchDetails: bcscAutoMatchDetails
    };
  } catch(e) {
    throw new ServiceError('getAutoMatchResults error', e);
  }
}

async function postRequest(accessToken, reqData, userInfo) {
  try{
    const url = config.get('studentProfile:apiEndpoint') + '/';

    if(userInfo.accountType === 'BCSC') {
      const autoMatchResults = await getAutoMatchResults(accessToken, userInfo);
      reqData.bcscAutoMatchOutcome = autoMatchResults.bcscAutoMatchOutcome;
      reqData.bcscAutoMatchDetails = autoMatchResults.bcscAutoMatchDetails;
    }

    reqData.emailVerified = EmailVerificationStatuses.NOT_VERIFIED;
    reqData.digitalID = userInfo.digitalIdentityID;
    let resData = await postData(accessToken, reqData, url);
    resData.digitalID = null;

    return resData;
  } catch(e) {
    throw new ServiceError('postRequest error', e);
  }
}

async function submitRequest(req, res) {
  try{
    const userInfo = getSessionUser(req);
    if(!userInfo) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }

    const accessToken = userInfo.jwt;

    if(req && req.session && req.session.request && req.session.request.studentRequestStatusCode !== RequestStatuses.REJECTED && 
      req.session.request.studentRequestStatusCode !== RequestStatuses.ABANDONED && 
      req.session.request.studentRequestStatusCode !== RequestStatuses.COMPLETED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Submit Request not allowed'
      });
    }

    const resData = await postRequest(accessToken, req.body, userInfo._json);

    req.session.request = resData;
    if(req.body.email && req.body.email !== req.body.recordedEmail) {
      sendVerificationEmail(accessToken, req.body.email, resData.studentRequestID, req.session.digitalIdentityData.identityTypeLabel).catch(e => 
        log.error('sendVerificationEmail Error', e.stack)
      );
    }
    
    return res.status(HttpStatus.OK).json(resData);
  } catch(e) {
    log.error('submitRequest Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Submit request error',
      errorSource: e.errorSource
    });
  }
}

async function postComment(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(!req || !req.session || !req.session.request || req.session.request.studentRequestStatusCode !== RequestStatuses.RETURNED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Post comment not allowed'
      });
    }

    const url = `${config.get('studentProfile:apiEndpoint')}/${req.params.id}/comments`;
    const comment = {
      studentRequestID: req.params.id,
      staffMemberIDIRGUID: null,
      staffMemberName: null,
      commentContent: req.body.content,
      commentTimestamp: localDateTime.now().toString()
    };

    const data = await postData(accessToken, comment, url);

    const message = {
      content: data.commentContent,
      participantId: '1',
      myself: true,
      timestamp: data.commentTimestamp
    };
    return res.status(HttpStatus.OK).json(message);
  } catch(e) {
    log.error('postComment Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Post comment error'
    });
  }
}

async function getComments(req, res) {
  try{
    const userInfo = getSessionUser(req);
    if(!userInfo) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }

    const accessToken = userInfo.jwt;
    const url = `${config.get('studentProfile:apiEndpoint')}/${req.params.id}/comments`;

    const apiResData = await getData(accessToken, url);

    let response = {
      participants: [],
      myself: {
        name: userInfo._json.displayName,
        id: '1'
      },
      messages: []
    };
    apiResData.sort((a,b) => (a.commentTimestamp > b.commentTimestamp) ? 1 : ((b.commentTimestamp > a.commentTimestamp) ? -1 : 0));

    apiResData.forEach(element => {
      const participant = {
        name: (element.staffMemberName ? element.staffMemberName : 'Student'),
        id: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1')
      };

      if (participant && participant.id && participant.id.toUpperCase() !== response.myself.id.toUpperCase()) {
        const index = response.participants.findIndex((e) => e.id === participant.id);

        if (index === -1) {
          response.participants.push(participant);
        }
      }

      response.messages.push({
        content: element.commentContent,
        participantId: (element.staffMemberIDIRGUID ? element.staffMemberIDIRGUID : '1'),
        myself: participant.id.toUpperCase() === response.myself.id.toUpperCase(),
        timestamp: element.commentTimestamp
      });
    });

    return res.status(HttpStatus.OK).json(response);
  } catch (e) {
    log.error('getComments Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Comments Get error'
    });
  }
}

function beforeUpdateRequestAsInitrev(request) {
  if(request.studentRequestStatusCode !== RequestStatuses.DRAFT) {
    throw new ConflictStateError('Current Request Status: ' + request.studentRequestStatusCode);
  }

  if(request.emailVerified !== EmailVerificationStatuses.NOT_VERIFIED) {
    throw new ConflictStateError('Current Email Verification Status: ' + request.emailVerified);
  }
  
  request.initialSubmitDate = localDateTime.now().toString();
  request.emailVerified = EmailVerificationStatuses.VERIFIED;

  return request;
}

async function setRequestAsInitrev(requestID) {
  let data = await getApiCredentials(config.get('studentProfile:clientId'), config.get('studentProfile:clientSecret'));
  const accessToken = data.accessToken;

  return await updateRequestStatus(accessToken, requestID, RequestStatuses.INITREV, beforeUpdateRequestAsInitrev);
}

function verifyEmailToken(token) {
  try{
    const tokenPayload = jsonwebtoken.verify(token, config.get('email:secretKey'));
    if(tokenPayload.SCOPE !== 'VERIFY_EMAIL') {
      log.error('verifyEmailToken Error', `Invalid SCOPE: ${tokenPayload.SCOPE}`);
      return [{name: 'JsonWebTokenError'}, null];
    }

    if(! tokenPayload.jti) {
      log.error('verifyEmailToken Error', 'Invalid Request ID');
      return [{name: 'JsonWebTokenError'}, null];
    }

    return [null, tokenPayload.jti];
  }catch(e){
    log.error('verifyEmailToken Err', e.stack);
    return [e, null];
  }
}

async function verifyEmail(req, res) {
  const loggedin = getSessionUser(req);
  const baseUrl = config.get('server:frontend');
  const verificationUrl = baseUrl + '/verification/';

  if(! req.query.verificationToken) {
    return res.redirect(verificationUrl + VerificationResults.TOKEN_ERROR);
  }

  try{
    const [error, requestID] = verifyEmailToken(req.query.verificationToken);
    if(error && error.name === 'TokenExpiredError') {
      return res.redirect(loggedin ? baseUrl : (verificationUrl + VerificationResults.EXPIRED));
    } else if (error) {
      return res.redirect(verificationUrl + VerificationResults.TOKEN_ERROR);
    }

    const data = await setRequestAsInitrev(requestID);
    if(loggedin) {
      req.session.request = data;
    }
    
    return res.redirect(loggedin ? baseUrl : (verificationUrl + VerificationResults.OK));
  }catch(e){
    if(e instanceof ConflictStateError) {
      return res.redirect(loggedin ? baseUrl : (verificationUrl + VerificationResults.OK));
    } else {
      log.error('verifyEmail Error', e.stack);
      return res.redirect(verificationUrl + VerificationResults.SERVER_ERROR);
    }
  }
}

async function updateRequestStatus(accessToken, requestID, requestStatus, beforeUpdate) {
  try {
    let data = await getData(accessToken, `${config.get('studentProfile:apiEndpoint')}/${requestID}`);

    let request = beforeUpdate(data);
    request.studentRequestStatusCode = requestStatus;
    request.statusUpdateDate = localDateTime.now().toString();

    data = await putData(accessToken, request, config.get('studentProfile:apiEndpoint'));
    data.digitalID = null;

    return data;
  } catch (e) {
    if(e instanceof ConflictStateError) {
      throw e;
    } else {
      throw new ServiceError('updateRequestStatus error', e);
    }
  }
}

function beforeUpdateRequestAsSubsrev(request) {
  if(request.studentRequestStatusCode !== RequestStatuses.RETURNED) {
    throw new ConflictStateError('Current Request Status: ' + request.studentRequestStatusCode);
  }

  return request;
}

async function setRequestAsSubsrev(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    const requestID = req.params.id;
    const requestStatus = req.body.studentRequestStatusCode;

    if(! requestStatus) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No requestStatus data'
      });
    }

    if(requestStatus !== RequestStatuses.SUBSREV) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Wrong requestStatus'
      });
    }

    let data = await updateRequestStatus(accessToken, requestID, requestStatus, beforeUpdateRequestAsSubsrev);
    req.session.request = data;

    return res.status(HttpStatus.OK).json(data);
  } catch(e) {
    log.error('setRequestAsSubsrev Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Set request as subsrev error',
      errorSource: e.errorSource
    });
  }
}

async function resendVerificationEmail(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(req.session.request.studentRequestStatusCode !== RequestStatuses.DRAFT) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Resend email not allowed'
      });
    }

    const data = await sendVerificationEmail(accessToken, req.session.request.email, req.session.request.studentRequestID, 
      req.session.digitalIdentityData.identityTypeLabel);

    return res.status(HttpStatus.OK).json(data);
  } catch(e) {
    log.error('resendVerificationEmail Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Resend verification email error',
      errorSource: e.errorSource
    });
  }
}

async function uploadFile(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if(!req.session.request || req.session.request.studentRequestStatusCode !== RequestStatuses.RETURNED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Upload file not allowed'
      });
    }

    const url = `${config.get('studentProfile:apiEndpoint')}/${req.params.id}/documents`;

    const data = await postData(accessToken, req.body, url);
    return res.status(HttpStatus.OK).json(data);
  } catch(e) {
    log.error('uploadFile Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Upload file error'
    });
  }
}

async function getDocument(token, requestID, documentID, includeDocData = 'Y') {
  try {
    return await getData(token, `${config.get('studentProfile:apiEndpoint')}/${requestID}/documents/${documentID}?includeDocData=${includeDocData}`);  
  } catch (e) {
    throw new ServiceError('getDocument error', e);
  }
}

async function deleteDocument(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId, 'N');

    if(!req.session.request || resData.createDate <= req.session.request.statusUpdateDate || 
      req.session.request.studentRequestStatusCode !== RequestStatuses.RETURNED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Delete file not allowed'
      });
    }

    const url = `${config.get('studentProfile:apiEndpoint')}/${req.params.id}/documents/${req.params.documentId}`;

    await deleteData(accessToken, url);
    return res.status(HttpStatus.OK).json();
  } catch (e) {
    log.error('deleteDocument Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Delete document error',
      errorSource: e.errorSource
    });
  }
}

async function downloadFile(req, res) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    let resData = await getDocument(accessToken, req.params.id, req.params.documentId, 'Y');

    res.setHeader('Content-disposition', 'attachment; filename=' + resData.fileName);
    res.setHeader('Content-type', resData.fileExtension);

    return res.status(HttpStatus.OK).send(Buffer.from(resData.documentData, 'base64'));
  } catch (e) {
    log.error('downloadFile Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Download file error',
      errorSource: e.errorSource
    });
  }
}

module.exports = {
  getUserInfo,
  getCodes,
  submitRequest,
  postComment,
  getComments,
  verifyEmail,
  verifyEmailToken,
  setRequestAsSubsrev,
  resendVerificationEmail,
  getRequest,
  deleteDocument,
  downloadFile,
  uploadFile
};
