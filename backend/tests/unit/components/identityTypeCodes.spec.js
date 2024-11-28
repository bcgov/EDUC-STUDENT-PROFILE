import { describe, it, expect, afterEach, vi } from 'vitest';

import config from '../../../src/config/index.js';
import { _setCodes, _getCodes, getServerSideCodes } from '../../../src/components/identityTypeCodes';
import { ServiceError } from '../../../src/components/error';

import * as utils from '../../../src/components/utils';

describe('getServerSideCodes', () => {
  const codes =[
    {
      code: 'M',
      label: 'Male',
    },
    {
      code: 'F',
      label: 'Female',
    }
  ];

  const getDataSpy = vi.spyOn(utils, 'getData').mockResolvedValue(codes);

  afterEach(() => {
    _setCodes(null);
    vi.clearAllMocks();
  });

  it('should return codes', async () => {
    const result = await getServerSideCodes('token');

    expect(result).toBeTruthy();
    expect(result.identityTypes).toEqual(codes);
    expect((_getCodes())?.identityTypes).toEqual(codes);
    expect(getDataSpy).toHaveBeenCalledTimes(1);
    expect(getDataSpy).toHaveBeenCalledWith('token', `${config.get('digitalID:apiEndpoint')}/identityTypeCodes`);
  });

  it('should not call getData if codes exist', async () => {
    _setCodes({ identityTypes: codes });

    const result = await getServerSideCodes('token');

    expect(result).toBeTruthy();
    expect(result.identityTypes).toEqual(codes);
    expect(getDataSpy).toHaveBeenCalledTimes(0);
  });

  it('should throw ServiceError if getData is failed', async () => {
    utils.getData.mockRejectedValueOnce(new Error('error'));

    expect(getServerSideCodes('token')).rejects.toThrowError(ServiceError);
  });
});

