import HttpStatus from 'http-status-codes';
import config from '../../../src/config/index.js';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { postRequest, getDigitalIdData, getLatestRequest } from '../../../src/components/request.js';
import { ServiceError, ApiError } from '../../../src/components/error.js';
import * as utils from '../../../src/components/utils.js';
import { setStudentRequestReplicateStatus } from '../../../src/components/studentRequest.js';
import { LocalDateTime } from '@js-joda/core';

const correlationID = '67590460-efe3-4e84-9f9a-9acffda79657';

vi.mock('../../../src/components/redis-client.js');
vi.mock('../../../src/util/redis/redis-utils.js');


describe('postRequest', () => {
  const reqData = { legalLastName: 'legalLastName' };
  const userInfo = {
    digitalIdentityID: 'digitalIdentityID',
    displayName: 'Firstname Lastname',
    accountType: 'BCEID',
  };
  const requestType = 'studentRequest';

  const spy = vi.spyOn(utils, 'postData');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return request data', async () => {
    utils.postData.mockResolvedValue({studentRequestID: 'requestID'});

    const result = await postRequest('token', reqData, userInfo, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual('requestID');
    expect(result.digitalID).toBeNull();
    const requst = {
      ...reqData,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED,
      digitalID: userInfo.digitalIdentityID
    };
    expect(spy).toHaveBeenCalledWith('token', requst, config.get('studentRequest:apiEndpoint'), correlationID);
  });

  it('should return request data with autoMatchResults if accountType is BCSC', async () => {
    const userInfo = {
      digitalIdentityID: 'digitalIdentityID',
      displayName: 'Firstname Lastname',
      accountType: 'BCSC',
    };

    utils.postData.mockResolvedValue({studentRequestID: 'requestID'});

    const result = await postRequest('token', reqData, userInfo, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual('requestID');
    expect(result.digitalID).toBeNull();
    const requst = {
      ...reqData,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED,
      digitalID: userInfo.digitalIdentityID
    };
    expect(spy).toHaveBeenCalledWith('token', requst, config.get('studentRequest:apiEndpoint'), correlationID);
  });

  it('should return request data with ZEROMATCHES if accountType is BCSC and no autoMatchResults', async () => {
    const userInfo = {
      digitalIdentityID: 'digitalIdentityID',
      displayName: 'Firstname Lastname',
      accountType: 'BCSC',
    };

    vi.spyOn(utils, 'getDataWithParams');
    utils.postData.mockResolvedValue({studentRequestID: 'requestID'});

    const result = await postRequest('token', reqData, userInfo, requestType, correlationID);

    expect(result).toBeTruthy();
    expect(result.studentRequestID).toEqual('requestID');
    expect(result.digitalID).toBeNull();
    const requst = {
      ...reqData,
      emailVerified: utils.EmailVerificationStatuses.NOT_VERIFIED,
      digitalID: userInfo.digitalIdentityID
    };
    expect(spy).toHaveBeenCalledWith('token', requst, config.get('studentRequest:apiEndpoint'), correlationID);
  });

  it('should throw ServiceError if postData is failed', async () => {
    utils.postData.mockRejectedValue(new Error('error'));

    expect(postRequest('token', reqData, userInfo, correlationID)).rejects.toThrowError(ServiceError);
  });
});

describe('getDigitalIdData', () => {
  const digitalIdData = { data: 'data' };
  const getDataSpy = vi.spyOn(utils, 'getData').mockResolvedValue(digitalIdData);

  it('should return DigitalId data', async () => {
    const result = await getDigitalIdData('token', 'digitalID', correlationID);

    expect(result).toBeTruthy();
    expect(result.data).toEqual(digitalIdData.data);
    expect(getDataSpy).toHaveBeenCalledWith('token', config.get('digitalID:apiEndpoint') + '/digitalID', correlationID);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValueOnce(new Error('error'));

    expect(getDigitalIdData('token', 'digitalID')).rejects.toThrowError(ServiceError);
  });
});

describe('getLatestRequest', () => {
  const digitalID = 'ac337def-704b-169f-8170-653e2f7c001';
  let requests = [
    {
      digitalID,
      statusUpdateDate: '2020-03-03T23:05:40'
    },
    {
      digitalID,
      statusUpdateDate: '2020-03-05T07:05:59'
    },
    {
      digitalID,
      statusUpdateDate: '2020-03-04T10:05:40'
    },
  ];
  const requestType = 'studentRequest';
  const setReplicateStatus = setStudentRequestReplicateStatus;

  const spy = vi.spyOn(utils, 'getData');

  afterEach(() => {
    spy.mockClear();
  });

  it('should return the last request', async () => {
    utils.getData.mockResolvedValue(requests);

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus, correlationID);

    expect(result).toBeTruthy();
    expect(result.statusUpdateDate).toEqual('2020-03-05T07:05:59');
    expect(result.digitalID).toBeNull();
    expect(spy).toHaveBeenCalledWith('token', config.get('studentRequest:apiEndpoint') + `?digitalID=${digitalID}`, correlationID);
  });

  it('should return null if no requests', async () => {
    utils.getData.mockResolvedValue([]);

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus, correlationID);

    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith('token', config.get('studentRequest:apiEndpoint') + `?digitalID=${digitalID}`, correlationID);
  });

  it('should return null if getData return NOT_FOUND', async () => {
    utils.getData.mockRejectedValue(new ApiError(HttpStatus.NOT_FOUND, { message: 'API Get error' }));

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeNull();
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValue(new Error('error'));

    expect(getLatestRequest('token', digitalID, requestType, setReplicateStatus)).rejects.toThrowError(ServiceError);
  });

  it('should return tomorrow with false value if current time is after replicateTime', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T07:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-03T10:05:40');
    vi.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeFalsy();
  });

  it('should return tomorrow with true value if current time is before replicateTime', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T09:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-03T10:05:40');
    vi.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeTruthy();
  });

  it('should return tomorrow with true value if current time is the day after statusUpdateDate but before replicateTime', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T09:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-04T07:05:40');
    vi.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeTruthy();
  });

  it('should return tomorrow with false value if current time is the day after statusUpdateDate but after replicateTimee', async () => {
    requests = [
      {
        digitalID,
        statusUpdateDate: '2020-03-03T09:05:40',
        studentRequestStatusCode: 'COMPLETED',
      },
    ];

    const localTime = LocalDateTime.parse('2020-03-04T09:05:40');
    vi.spyOn(LocalDateTime, 'now');
    LocalDateTime.now.mockReturnValue(localTime);

    utils.getData.mockResolvedValue(requests);

    const result = await getLatestRequest('token', digitalID, requestType, setReplicateStatus);

    expect(result).toBeTruthy();
    expect(result.tomorrow).toBeFalsy();
  });
});
