import HttpStatus from 'http-status-codes';
import _ from 'lodash';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import * as requestHandler from '../../../src/components/requestHandler.js';
import * as identityTypeCodes from '../../../src/components/identityTypeCodes.js';
import { postRequest, getDigitalIdData, getLatestRequest } from '../../../src/components/request.js';
import { ServiceError, ConflictStateError } from '../../../src/components/error.js';
import { mockRequest, mockResponse } from '../helpers.js';
import { verifyStudentRequestStatus } from '../../../src/components/studentRequest.js';
import redis from 'redis-mock';
import * as redisClient from '../../../src/util/redis/redis-client.js';
import * as redisUtil from '../../../src/util/redis/redis-utils.js';
import * as email from '../../../src/components/email.js';

const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';

import * as utils from '../../../src/components/utils.js';

import { updateRequestStatus } from '../../../src/components/requestStatus.js';

vi.mock('../../../src/components/utils.js');
vi.mock('../../../src/components/request.js');
vi.mock('../../../src/components/requestStatus.js');

describe('verifyRequest', () => {
  const requestID = 'RequestID';
  const params = {
    id: requestID,
    documentId: 'documentId'
  };
  const requestType = 'studentRequest';
  const session = {
    [requestType]: {
      studentRequestID: requestID,
    },
    correlationID
  };
  const userInfo = { };
  const verifyRequestHandler = requestHandler.verifyRequest(requestType);

  let req;
  let res;
  let next;

  vi.spyOn(utils, 'getSessionUser');
  vi.spyOn(redisClient, 'getRedisClient');
  vi.spyOn(redisUtil, 'isSagaInProgressForDigitalID');

  utils.getSessionUser.mockReturnValue(userInfo);
  redisClient.getRedisClient.mockReturnValue(redis);
  redisUtil.isSagaInProgressForDigitalID.mockReturnValue(false);

  beforeEach(() => {
    req = mockRequest(null, session, params);
    res = mockResponse();
    next = vi.fn();
  });

  it('should call next', () => {
    verifyRequestHandler(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValueOnce(null);

    verifyRequestHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return BAD_REQUEST if no request in session', async () => {
    const session = {
    };

    req = mockRequest(null, session, params);
    verifyRequestHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if different requestID in session', async () => {
    const session = {
      studentRequestID: 'OtherRequestID,'
    };
    req = mockRequest(null, session, params);
    verifyRequestHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});

describe('getUserInfo', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';
  const requestOpts = {
    digitalID,
    statusUpdateDate: '2020-03-03T23:05:40'
  };

  const sessionUser = {
    jwt: 'token',
    _json: {
      digitalIdentityID: digitalID,
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
    }
  };

  const digitalIdData = {
    identityTypeCode: 'BASIC',
    studentID: null
  };

  const codes = {
    identityTypes: [
      {
        identityTypeCode: 'BCSC',
        label: 'BC Services Card',
      },
      {
        identityTypeCode: 'BASIC',
        label: 'Basic BCeID',
      }
    ]
  };

  let req;
  let res;

  const getSessionUserSpy = vi.spyOn(utils, 'getSessionUser');

  vi.spyOn(identityTypeCodes, 'getServerSideCodes').mockResolvedValue(codes);
  getLatestRequest.mockResolvedValue(requestOpts);
  getDigitalIdData.mockResolvedValue(digitalIdData);
  utils.getSessionUser.mockReturnValue(sessionUser);

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  it('should return UNAUTHORIZED if no session', async () => {
    getSessionUserSpy.mockReturnValueOnce(null);

    await requestHandler.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return user info without student info if no student info', async () => {
    await requestHandler.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: sessionUser._json.displayName,
      accountType: sessionUser._json.accountType,
      identityTypeLabel: _.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
      studentRequest: requestOpts,
      penRequest: requestOpts,
      student: null,
    });
  });

  it('should return user info with student info if there is student info', async () => {
    const studentID = 'ac337def-704b-169f-8170-653e2f7c090';
    const digitalIdData = {
      identityTypeCode: 'BASIC',
      studentID
    };

    const student = null;

    getDigitalIdData.mockResolvedValueOnce(digitalIdData);
    utils.getStudent.mockResolvedValueOnce(student);

    await requestHandler.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: sessionUser._json.displayName,
      accountType: sessionUser._json.accountType,
      identityTypeLabel: _.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
      studentRequest: requestOpts,
      penRequest: requestOpts,
      student,
    });
  });

  it('should return user info with BCSC info if accountType is BCSC', async () => {
    const bcscUser = {
      jwt: 'token',
      _json: {
        digitalIdentityID: digitalID,
        displayName: 'Firstname Lastname',
        accountType: 'BCSC',
      }
    };

    const bcscInfo = { legalLastName: 'LegalName' };

    getSessionUserSpy.mockReturnValueOnce(bcscUser);
    utils.getDefaultBcscInput.mockReturnValueOnce(bcscInfo);
    getLatestRequest.mockResolvedValueOnce(requestOpts);
    getDigitalIdData.mockResolvedValueOnce(digitalIdData);

    await requestHandler.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      displayName: bcscUser._json.displayName,
      accountType: bcscUser._json.accountType,
      ...bcscInfo,
      identityTypeLabel: _.find(codes.identityTypes, ['identityTypeCode', digitalIdData.identityTypeCode]).label,
      studentRequest: requestOpts,
      penRequest: requestOpts,
      student: null,
    });
  });

  it('should return INTERNAL_SERVER_ERROR if invalid identityTypeCode', async () => {
    const digitalIdData = {
      identityTypeCode: 'INVALID',
      studentID: null
    };

    getDigitalIdData.mockResolvedValueOnce(digitalIdData);

    await requestHandler.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    getDigitalIdData.mockRejectedValueOnce(new ServiceError('Test Error'));

    await requestHandler.getUserInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('getCodes', () => {
  const codes =[
    {
      effectiveDate: '2020-01-01T00:00:00',
      expiryDate: '2099-12-31T00:00:00',
      code: 'Code2',
      label: 'Label2',
      displayOrder: 1
    },
    {
      effectiveDate: '2020-01-01T00:00:00',
      expiryDate: '2099-12-31T00:00:00',
      code: 'Code1',
      label: 'Label1',
      displayOrder: 2
    },
    {
      effectiveDate: '2020-01-01T00:00:00',
      expiryDate: '2099-12-31T00:00:00',
      code: 'Code3',
      label: 'Label3',
      displayOrder: 3
    }
  ];
  const studentRequestGetCodes = requestHandler.getCodes('studentRequest');

  let req;
  let res;

  vi.spyOn(utils, 'getAccessToken');
  vi.spyOn(utils, 'getData');

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue('token');
    utils.getData.mockResolvedValue(codes);
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return codes', async () => {
    await studentRequestGetCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      statusCodes: codes,
    });
  });

  it('should return UNAUTHORIZED if no access token', async () => {
    utils.getAccessToken.mockReturnValue(null);

    await studentRequestGetCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    utils.getData.mockRejectedValue(new Error('test error'));

    await studentRequestGetCodes(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});

describe('submitRequest', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';
  const requestOpts = {
    legalLastName: 'legalLastName'
  };

  const requestRes = {
    studentRequestID: 'requestID',
    digitalID: null,
  };

  const sessionUser = {
    jwt: 'token',
    _json: {
      digitalIdentityID: digitalID,
      displayName: 'Firstname Lastname',
      accountType: 'BCEID',
    }
  };

  const requestType = 'studentRequest';
  const submitRequestHandler = requestHandler.submitRequest(requestType, verifyStudentRequestStatus);

  let session;

  let req;
  let res;

  vi.spyOn(utils, 'getSessionUser');
  vi.spyOn(utils, 'postData');
  const mailSpy = vi.spyOn(email, 'sendVerificationEmail');

  beforeEach(() => {
    session = {
      digitalIdentityData: {
        identityTypeLabel: 'identityTypeLabel',
      }
    };
    utils.getSessionUser.mockReturnValue(sessionUser);
    req = mockRequest(requestOpts, session);
    res = mockResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return UNAUTHORIZED if no session', async () => {
    utils.getSessionUser.mockReturnValue(null);

    await submitRequestHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return request response and send verification email', async () => {
    postRequest.mockReturnValueOnce(requestRes);

    await submitRequestHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestRes);
    expect(req.session[requestType]).toEqual(requestRes);
  });

  it('should return CONFLICT if the status of existed request is not REJECTED', async () => {
    session = {
      ...session,
      [requestType]: {
        studentRequestStatusCode: utils.RequestStatuses.DRAFT,
      }
    };

    req = mockRequest(requestOpts, session);

    await submitRequestHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if exceptions thrown', async () => {
    postRequest.mockRejectedValueOnce(new ServiceError('Test error'));

    await submitRequestHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should return request response if sending verification email failed', async () => {
    mailSpy.mockRejectedValueOnce(new ServiceError('Test error'));
    postRequest.mockReturnValueOnce(requestRes);

    await submitRequestHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestRes);
    expect(req.session[requestType]).toEqual(requestRes);
  });

  it('should return request response if the status of existed request is REJECTED', async () => {
    session = {
      ...session,
      [requestType]: {
        studentRequestStatusCode: utils.RequestStatuses.REJECTED,
      }
    };

    req = mockRequest(requestOpts, session);
    utils.postData.mockReturnValueOnce({studentRequestID: 'requestID'});
    postRequest.mockReturnValueOnce(requestRes);

    await submitRequestHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestRes);
    expect(req.session[requestType]).toEqual(requestRes);
  });
});

describe('beforeUpdateRequestAsSubsrev', () => {
  const requestType = 'studentRequest';

  it('should throw ConflictStateError if request is not RETURNED', async () => {
    let requestOpts = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
    };

    expect(() => requestHandler.beforeUpdateRequestAsSubsrev(requestOpts, requestType))
      .toThrowError(ConflictStateError);
  });

  it('should return request if request is RETURNED', async () => {
    let requestOpts = {
      studentRequestStatusCode: utils.RequestStatuses.RETURNED,
    };

    const result = requestHandler.beforeUpdateRequestAsSubsrev(requestOpts, requestType);

    expect(result).toEqual(requestOpts);
  });
});

describe('setRequestAsSubsrev', () => {
  const requestID = 'requestID';
  const requestOpts = {
    studentRequestID: requestID
  };
  const accessToken = 'token';
  const reqBody = {
    studentRequestStatusCode: utils.RequestStatuses.SUBSREV
  };
  vi.spyOn(utils, 'getAccessToken');
  const requestType = 'studentRequest';
  const setRequestAsSubsrevHandler = requestHandler.setRequestAsSubsrev(requestType);

  let req;
  let res;

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue(accessToken);
    req = mockRequest(reqBody, undefined, {id: requestID});
    res = mockResponse();
    updateRequestStatus.mockResolvedValue(requestOpts);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return OK and request data', async () => {
    await setRequestAsSubsrevHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(requestOpts);
    expect(req.session[requestType]).toEqual(requestOpts);
    expect(updateRequestStatus).toHaveBeenCalledWith(
      accessToken,
      requestID,
      reqBody.studentRequestStatusCode,
      requestType,
      requestHandler.beforeUpdateRequestAsSubsrev
    );
  });

  it('should return UNAUTHORIZED if no access token in session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    await setRequestAsSubsrevHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return BAD_REQUEST if requestStatus is not RETURNED in request body', async () => {
    const reqBody = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV
    };
    req = mockRequest(reqBody, undefined, {id: requestID});
    await setRequestAsSubsrevHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD_REQUEST if no requestStatus in request body', async () => {
    req = mockRequest({}, undefined, {id: requestID});
    await setRequestAsSubsrevHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should return INTERNAL_SERVER_ERROR if errors thrown', async () => {
    updateRequestStatus.mockRejectedValue(new Error('test error'));
    await setRequestAsSubsrevHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});

describe('resendVerificationEmail', () => {
  const requestID = 'requestID';
  const requestOpts = {
    studentRequestID: requestID,
    studentRequestStatusCode: utils.RequestStatuses.DRAFT,
    email: 'user@test.com'
  };
  const digitalIdentityData = {
    identityTypeLabel: 'identityTypeLabel'
  };
  const accessToken = 'token';
  const requestType = 'studentRequest';
  const session = {
    [requestType]: requestOpts,
    digitalIdentityData
  };
  const resData = {
    data: 'data'
  };
  vi.spyOn(utils, 'getAccessToken');

  const sendVerificationEmailSpy = vi.spyOn(email, 'sendVerificationEmail');
  const resendVerificationEmailHandler = requestHandler.resendVerificationEmail(requestType);

  let req;
  let res;

  beforeEach(() => {
    utils.getAccessToken.mockReturnValue(accessToken);
    req = mockRequest(null, session);
    res = mockResponse();
    sendVerificationEmailSpy.mockResolvedValue(resData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return OK and response data', async () => {
    await resendVerificationEmailHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith(resData);
    expect(sendVerificationEmailSpy).toHaveBeenCalledWith(accessToken, requestOpts.email, requestOpts.studentRequestID, digitalIdentityData.identityTypeLabel, requestType);
  });

  it('should return UNAUTHORIZED if no access token in session', async () => {
    utils.getAccessToken.mockReturnValue(null);
    await resendVerificationEmailHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
  });

  it('should return CONFLICT if requestStatus is not DRAFT in session', async () => {
    const request = {
      studentRequestID: requestID,
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
      email: 'user@test.com'
    };
    const session = {
      [requestType]: request,
      digitalIdentityData
    };
    req = mockRequest(null, session);
    await resendVerificationEmailHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('should return INTERNAL_SERVER_ERROR if errors thrown', async () => {
    sendVerificationEmailSpy.mockRejectedValue(new Error('test error'));
    await resendVerificationEmailHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

});
