import config from '../config/index.js';
import { ConflictStateError, ServiceError } from './error.js';
import { LocalDateTime } from '@js-joda/core';
import { putData, getData } from './utils.js';

export async function updateRequestStatus(accessToken, requestID, requestStatus, requestType, beforeUpdate, correlationID) {
  try {
    const endpoint = config.get(`${requestType}:apiEndpoint`);
    let data = await getData(accessToken, `${endpoint}/${requestID}`, correlationID);

    let request = beforeUpdate(data, requestType);
    request[`${requestType}StatusCode`] = requestStatus;
    request.statusUpdateDate = LocalDateTime.now().toString();

    data = await putData(accessToken, request, endpoint, correlationID);
    data.digitalID = null;

    return data;
  } catch (e) {
    if (e instanceof ConflictStateError) {
      throw e;
    } else {
      throw new ServiceError('updateRequestStatus error', e);
    }
  }
}
