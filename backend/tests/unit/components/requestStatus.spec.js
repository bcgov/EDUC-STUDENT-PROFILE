import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { ConflictStateError, ServiceError } from '../../../src/components/error.js';
import config from '../../../src/config/index.js';
import { LocalDateTime } from '@js-joda/core';
import { updateRequestStatus } from '../../../src/components/requestStatus.js';

import * as utils from '../../../src/components/utils.js';

const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';

describe('updateRequestStatus', () => {
  const localDateTime = '2020-01-01T12:00:00';
  const requestID = 'requestID';
  let requestOpts = {
    studentRequestID: requestID,
    digitalID: 'digitalID'
  };
  const requestType = 'studentRequest';

  const getDataSpy = vi.spyOn(utils, 'getData');
  const putDataSpy = vi.spyOn(utils, 'putData');

  vi.spyOn(LocalDateTime, 'now');

  beforeEach(() => {
    LocalDateTime.now.mockReturnValue(localDateTime);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return request data', async () => {
    utils.getData.mockResolvedValue(requestOpts);
    utils.putData.mockResolvedValue(requestOpts);

    const result = await updateRequestStatus(
      'token',
      requestID,
      utils.RequestStatuses.INITREV,
      requestType,
      () => requestOpts,
      correlationID
    );

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual(requestID);
    expect(result.digitalID).toBeNull();
    expect(result.studentRequestStatusCode).toEqual(utils.RequestStatuses.INITREV);
    expect(result.statusUpdateDate).toEqual(localDateTime);

    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('studentRequest:apiEndpoint')}/${requestID}`, correlationID);
    expect(putDataSpy).toHaveBeenCalledWith('token', requestOpts ,config.get('studentRequest:apiEndpoint'), correlationID);
  });

  it('should throw ConflictStateError if ConflictStateError is already raised', async () => {
    utils.getData.mockResolvedValue(requestOpts);

    await expect(updateRequestStatus(
      'token',
      requestID,
      utils.RequestStatuses.INITREV,
      requestType,
      () => { throw new ConflictStateError(); }
    )).rejects.toThrowError(ConflictStateError);
  });

  it('should throw ServiceError if other errors are already raised', async () => {
    utils.getData.mockResolvedValue(requestOpts);
    utils.putData.mockRejectedValue(new Error('error'));

    await expect(updateRequestStatus(
      'token',
      requestID,
      utils.RequestStatuses.INITREV,
      requestType,
      () => requestOpts
    )).rejects.toThrowError(ServiceError);
  });
});
