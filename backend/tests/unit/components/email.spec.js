import { describe, it, expect, afterEach, vi } from 'vitest';
import * as utils from '../../../src/components/utils.js';
import { sendVerificationEmail } from '../../../src/components/email.js';
import { ServiceError } from '../../../src/components/error.js';

const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';

describe('sendVerificationEmail', () => {
  const emailAddress = 'name@test.com';
  const requestId = 'requestId';
  const identityTypeLabel = 'identityTypeLabel';
  const response = {data: 'data'};
  const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJTQ09QRSI6IlZFUklGWV9FTUFJTCIsImlhdCI6MTU4OTQ4NDY0NCwiZXhwIjoxNTg5NTcxMDQ0LCJpc3MiOiJWZXJpZnlFbWFpbEFQSSIsInN1YiI6Im5hbWVAdGVzdC5jb20iLCJqdGkiOiJwZW5SZXF1ZXN0SWQifQ.SVa1Cm7wIMioC9S98-PxFC1BWXanfD941ySp23aNr_w';
  const generateTokenSpy = vi.spyOn(utils, 'generateJWTToken');
  const postDataSpy = vi.spyOn(utils, 'postData');
  const requestType = 'studentRequest';

  afterEach(() => {
    postDataSpy.mockClear();
  });

  it('should return response data', async () => {
    utils.postData.mockResolvedValue(response);
    utils.generateJWTToken.mockResolvedValue(token);
    const result = await sendVerificationEmail('token', emailAddress, requestId, identityTypeLabel, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result).toEqual(response);
    expect(generateTokenSpy).toHaveBeenCalledWith(requestId,emailAddress,'VerifyEmailAPI','HS256',{
      SCOPE: 'VERIFY_EMAIL'
    });
  });

  it('should throw ServiceError if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('error'));

    expect(sendVerificationEmail('token', emailAddress, requestId, identityTypeLabel, requestType)).rejects.toThrowError(ServiceError);
  });
});
