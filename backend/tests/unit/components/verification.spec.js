import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalDateTime } from '@js-joda/core';

import config from '../../../src/config/index.js';
import * as utils from '../../../src/components/utils.js';
import * as auth from '../../../src/components/auth.js';
import * as changeRequestHandler from '../../../src/components/requestHandler.js';

import { ConflictStateError } from '../../../src/components/error.js';
import { mockRequest, mockResponse } from '../helpers.js';

const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';

vi.mock('../../../src/components/auth.js');
vi.mock('../../../src/components/utils.js');

describe('beforeUpdateRequestAsInitrev', () => {
  const localDateTime = '2020-01-01T12:00:00';
  const requestType = 'studentRequest';

  vi.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    LocalDateTime.now.mockReturnValue(localDateTime);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return request with VERIFIED and initialSubmitDate', async () => {
    let request = {
      studentRequestStatusCode: utils.RequestStatuses.DRAFT,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED
    };

    const result = await changeRequestHandler.beforeUpdateRequestAsInitrev(request, requestType);

    expect(result).toEqual({
      ...request,
      initialSubmitDate: localDateTime,
      emailVerified: utils.EmailVerificationStatuses.VERIFIED
    });
  });

  it('should throw ConflictStateError if request is not DRAFT', async () => {
    let request = {
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED
    };

    expect(() => changeRequestHandler.beforeUpdateRequestAsInitrev(request, requestType)).toThrowError(ConflictStateError);
  });

  it('should throw ConflictStateError if request is already VERIFIED', async () => {
    let request = {
      studentRequestStatusCode: utils.RequestStatuses.DRAFT,
      emailVerified: utils.EmailVerificationStatuses.VERIFIED
    };

    expect(() => changeRequestHandler.beforeUpdateRequestAsInitrev(request, requestType)).toThrowError(ConflictStateError);
  });

});

describe('setRequestAsInitrev', () => {
  const localDateTime = '2020-01-01T12:00:00';
  const requestID = 'requestID';
  let request = {
    studentRequestID: requestID,
    digitalID: 'digitalID',
    studentRequestStatusCode: utils.RequestStatuses.DRAFT,
    emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED
  };
  const requestType = 'studentRequest';

  const getDataSpy = vi.spyOn(utils, 'getData');
  const putDataSpy = vi.spyOn(utils, 'putData');
  const authSpy = vi.spyOn(auth, 'getApiCredentials');

  vi.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    LocalDateTime.now.mockReturnValue(localDateTime);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return request data', async () => {
    utils.getData.mockResolvedValue(request);
    utils.putData.mockResolvedValue(request);
    auth.getApiCredentials.mockResolvedValue({accessToken: 'token'});

    const result = await changeRequestHandler.setRequestAsInitrev(requestID, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual(requestID);
    expect(result.digitalID).toBeNull();
    expect(result.studentRequestStatusCode).toEqual(utils.RequestStatuses.INITREV);
    expect(result.emailVerified).toEqual(utils.EmailVerificationStatuses.VERIFIED);
    expect(result.statusUpdateDate).toEqual(localDateTime);

    expect(authSpy).toHaveBeenCalledTimes(1);
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${requestID}`, correlationID);
    expect(putDataSpy).toHaveBeenCalledWith('token', request ,config.get('studentRequest:apiEndpoint'), correlationID);
  });

  it('should throw ConflictStateError if request is not DRAFT', async () => {
    let request = {
      studentRequestID: requestID,
      digitalID: 'digitalID',
      studentRequestStatusCode: utils.RequestStatuses.INITREV,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED
    };
    utils.getData.mockResolvedValue(request);
    auth.getApiCredentials.mockResolvedValue({accessToken: 'token'});

    expect(changeRequestHandler.setRequestAsInitrev(requestID, requestType)).rejects.toThrowError(ConflictStateError);
  });
});

describe('verifyEmailToken', () => {
  it('should return requestID if valid token', async () => {
    const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiU0NPUEUiOiJWRVJJRllfRU1BSUwiLCJpYXQiOjE1MTYyMzkwMjJ9.3Qlu82ltNX0DJKwWedrT5MX2Nk9hn8cKbd6PpktTVAl_RTH42lkaolhdOFwlrC5g1kJh9rt-QmF8ABDqlpWpHA';

    expect(changeRequestHandler.verifyEmailToken(token)).toEqual([null, '1234567890']);
  });

  it('should return error if invalid token', async () => {
    const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiU0NPUEUiOiJWRVJJRllfRU1BSUwiLCJpYXQiOjE1MTYyMzkwMjJ9.3Qlu82ltNX0DJKwWedrT5MX2Nk9hn8cKbd6PpktTVAl_RTH42lkaolhdOFwlrC5g1kJh9rt-QmF8ABDqlpWpKA';

    const result = changeRequestHandler.verifyEmailToken(token);
    expect(result[0]).toBeTruthy();
    expect(result[1]).toBeNull();
  });

  it('should return error if wrong token SCOPE', async () => {
    const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.N5s4iL02C9W14Jsue2wNn76nelQMBcev-kNfZbvrkrsfEwJxe6l-U4M9xVqKW-bPkSMxXCpVZ0hrC6aL3njyuQ';

    const result = changeRequestHandler.verifyEmailToken(token);
    expect(result[0]).toBeTruthy();
    expect(result[0].name).toEqual('JsonWebTokenError');
    expect(result[1]).toBeNull();
  });

  it('should return error if no requestID', async () => {
    const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJTQ09QRSI6IlZFUklGWV9FTUFJTCIsImlhdCI6MTUxNjIzOTAyMn0.flzoPiee7N6bHuq424_8a5wmyqd5qIY1tXEP4Ouv0ueA6E-7hPJonKlK4K_az3tKPRMlGNsfbd6C3MeK4VRg6g';

    const result = changeRequestHandler.verifyEmailToken(token);
    expect(result[0]).toBeTruthy();
    expect(result[0].name).toEqual('JsonWebTokenError');
    expect(result[1]).toBeNull();
  });
});

describe('verifyEmail', () => {
  const request = {
    studentRequestID: 'requestID'
  };
  const appName = 'ump';
  const query = {
    verificationToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiU0NPUEUiOiJWRVJJRllfRU1BSUwiLCJpYXQiOjE1MTYyMzkwMjJ9.3Qlu82ltNX0DJKwWedrT5MX2Nk9hn8cKbd6PpktTVAl_RTH42lkaolhdOFwlrC5g1kJh9rt-QmF8ABDqlpWpHA',
  };
  vi.spyOn(utils, 'getSessionUser');
  const setRequestAsInitrevSpy = vi.spyOn(changeRequestHandler, 'setRequestAsInitrev');

  const requestType = 'studentRequest';
  let verifyEmailHandler = changeRequestHandler.verifyEmail(requestType);

  let req;
  let res;

  beforeEach(() => {
    utils.getSessionUser.mockReturnValue({});
    req = mockRequest(null, undefined, undefined, query);
    req.session= {
      correlationID
    };
    res = mockResponse({ accessToken: 'defined' });
    setRequestAsInitrevSpy.mockResolvedValue(request);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to home url if the user logged in', async () => {
    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}`);
  });

  it('should redirect to verification OK url if the user not logged in', async () => {
    utils.getSessionUser.mockReturnValue();
    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}/verification/${utils.VerificationResults.OK}`);
    expect(req.session[requestType]).toBeFalsy();
  });

  it('should redirect to TOKEN_ERROR url if no verificationToken', async () => {
    req = mockRequest();
    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}/verification/${utils.VerificationResults.TOKEN_ERROR}`);
  });

  it('should redirect to home url if verificationToken expired and the user logged in', async () => {
    const query = {
      verificationToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiU0NPUEUiOiJWRVJJRllfRU1BSUwiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.0w1CC5hsYGa_CTrNcccR2fx-xPxq-_mXrFZmhJcMj7Lcra8TmKGPKZkwsFVcXBXA11cnRQDZtrrbC18sWVx-Uw',
    };
    req = mockRequest(null, undefined, undefined, query);
    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}`);
  });

  it('should redirect to EXPIRED url if verificationToken expired and the user not logged in', async () => {
    const query = {
      verificationToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiU0NPUEUiOiJWRVJJRllfRU1BSUwiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.0w1CC5hsYGa_CTrNcccR2fx-xPxq-_mXrFZmhJcMj7Lcra8TmKGPKZkwsFVcXBXA11cnRQDZtrrbC18sWVx-Uw',
    };
    req = mockRequest(null, undefined, undefined, query);
    utils.getSessionUser.mockReturnValue();
    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}/verification/${utils.VerificationResults.EXPIRED}`);
  });

  it('should redirect to TOKEN_ERROR url if wrong token SCOPE', async () => {
    const query = {
      verificationToken: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.N5s4iL02C9W14Jsue2wNn76nelQMBcev-kNfZbvrkrsfEwJxe6l-U4M9xVqKW-bPkSMxXCpVZ0hrC6aL3njyuQ',
    };
    req = mockRequest(null, undefined, undefined, query);
    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}/verification/${utils.VerificationResults.TOKEN_ERROR}`);
  });

  it('should redirect to home url if ConflictStateError thrown and the user logged in', async () => {
    setRequestAsInitrevSpy.mockRejectedValue(new ConflictStateError('test error'));

    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}`);
  });

  it('should redirect to verification OK url if ConflictStateError thrown and the user not logged in', async () => {
    setRequestAsInitrevSpy.mockRejectedValue(new ConflictStateError('test error'));
    utils.getSessionUser.mockReturnValue();

    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}/verification/${utils.VerificationResults.OK}`);
  });

  it('should redirect to SERVER_ERROR url if other Errors thrown', async () => {
    vi.spyOn(utils, 'getData').mockRejectedValueOnce(new Error('test error'));

    await verifyEmailHandler(req, res);

    expect(res.redirect).toHaveBeenCalledWith(`${config.get('server:frontend')}/${appName}/verification/${utils.VerificationResults.SERVER_ERROR}`);
  });
});
