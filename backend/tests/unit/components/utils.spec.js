import axios from 'axios';
import { describe, it, expect, afterEach } from 'vitest';
import config from '../../../src/config/index.js';
import * as utils from '../../../src/components/utils.js';
import MockAdapter from 'axios-mock-adapter';

const mockAxios = new MockAdapter(axios);

describe('minify', () => {
  it('should return minified documentData by default', async () => {
    const result = utils.minify({ fileName: 'testfile.pdf', documentData: '0123456789' });
    expect(result.documentData.length).toBe(5);
  });

  it('should return other fields without changes', async () => {
    const result = utils.minify({ fileName: 'testfile.pdf', documentData: '0123456789' });
    expect(result.fileName).toBe('testfile.pdf');
  });

  it('should return minified fields if their names are passed into', async () => {
    const result = utils.minify({ fileName: 'testfile.pdf', documentData: '0123456789' }, ['documentData', 'fileName']);
    expect(result.fileName.length).toBe(5);
    expect(result.documentData.length).toBe(5);
  });
});

describe('getOidcDiscovery', () => {
  const url = 'http://token.endpoint';
  const discovery = {
    token_endpoint: url,
    scopes_supported: ['openid', 'offline_access'],
  };

  afterEach(() => {
    utils.setDiscovery(null);
  });

  it('should return discovery data', async () => {
    mockAxios.onGet(config.get('oidc:discovery')).reply(200, discovery);

    const result = await utils.getOidcDiscovery();

    expect(result).toEqual(discovery);
    expect(utils.getDiscovery()).toEqual(discovery);
  });

  it('should return null if errors thrown', async () => {
    mockAxios.onGet(config.get('oidc:discovery')).reply(404);

    const result = await utils.getOidcDiscovery();

    expect(result).toBeNull();
    expect(utils.getDiscovery()).toBeNull();
  });
});

describe('getDefaultBcscInput', () => {
  it('should return middleNames', async () => {
    const userInfo = {
      _json: {
        givenNames: 'FirstName MiddleName',
      }
    };

    const result = utils.getDefaultBcscInput(userInfo);

    expect(result).toBeTruthy();
    expect(result.legalMiddleNames).toEqual('MiddleName');
  });

  it('should return empty string if no middle name', async () => {
    const userInfo = {
      _json: {
        givenNames: 'FirstName',
      }
    };

    const result = utils.getDefaultBcscInput(userInfo);

    expect(result).toBeTruthy();
    expect(result.legalMiddleNames.length).toBe(0);
  });

  it('should return empty string if no given names', async () => {
    const userInfo = {
      _json: {
        givenNames: '',
      }
    };

    const result = utils.getDefaultBcscInput(userInfo);

    expect(result).toBeTruthy();
    expect(result.legalMiddleNames.length).toBe(0);
  });
});
