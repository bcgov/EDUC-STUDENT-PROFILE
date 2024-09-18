import config from '../config/index.js';
import _ from 'lodash';
import HttpStatus from 'http-status-codes';
import { EmailVerificationStatuses } from './utils.js';
import { ServiceError } from './error.js';
import { getData, postData } from './utils.js';
import * as redisUtil from '../util/redis/redis-utils.js';

export async function postRequest(accessToken, reqData, userInfo, requestType, correlationID) {
  try {
    const url = config.get(`${requestType}:apiEndpoint`);

    if (!reqData.emailVerified) {
      reqData.emailVerified = EmailVerificationStatuses.NOT_VERIFIED;
    }
    reqData.digitalID = userInfo.digitalIdentityID;
    let resData = await postData(accessToken, reqData, url, correlationID);
    resData.digitalID = null;

    return resData;
  } catch(e) {
    throw new ServiceError('postRequest error', e);
  }
}

export async function getDigitalIdData(token, digitalID, correlationID) {
  try {
    return await getData(token, config.get('digitalID:apiEndpoint') + `/${digitalID}`, correlationID);
  } catch (e) {
    throw new ServiceError('getDigitalIdData error', e);
  }
}

export async function getLatestRequest(token, digitalID, requestType, setReplicateStatus, correlationID) {
  let request = null;
  let sagaInProgress = false;
  const url = config.get(`${requestType}:apiEndpoint`);
  try {
    let data = await getData(token, `${url}?digitalID=${digitalID}`, correlationID);
    request = _.maxBy(data, 'statusUpdateDate') || null;
    if(request) {
      sagaInProgress = await redisUtil.isSagaInProgressForDigitalID(request.digitalID);
      request.digitalID = null;
      request = setReplicateStatus(request);
      request.sagaInProgress = sagaInProgress;
    }
  } catch(e) {
    if(!e.status || e.status !== HttpStatus.NOT_FOUND) {
      throw new ServiceError('getLatestRequest error', e);
    }
  }

  return request;
}
