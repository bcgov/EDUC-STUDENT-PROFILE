import config from '../config/index.js';
import { ServiceError } from './error.js';
import { postData, generateJWTToken, RequestApps } from './utils.js';
import log from './logger.js';

export async function sendVerificationEmail(accessToken, emailAddress, requestId, identityTypeLabel, requestType, correlationID) {
  const verificationUrl = config.get('server:frontend') + `/api/${RequestApps[requestType]}/verification?verificationToken`;
  const reqData = {
    emailAddress,
    [`${requestType}Id`]: requestId,
    identityTypeLabel,
    verificationUrl: verificationUrl
  };
  log.info('sendVerificationEmail reqData', reqData);
  const url = config.get('email:apiEndpoint') + `/${RequestApps[requestType]}/verify`;
  try {
    const payload = {
      SCOPE: 'VERIFY_EMAIL'
    };
    reqData.jwtToken = generateJWTToken(requestId, emailAddress, 'VerifyEmailAPI', 'HS256', payload);
    return await postData(accessToken, reqData, url, correlationID);
  } catch (e) {
    throw new ServiceError('sendVerificationEmail error', e);
  }
}
