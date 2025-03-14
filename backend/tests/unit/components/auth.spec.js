import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, vi, afterEach } from 'vitest';

import * as auth from '../../../src/components/auth.js';
import * as utils from '../../../src/components/utils.js';

vi.mock('../../../src/components/utils');

const mockAxios = new MockAdapter(axios);

const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.2H0EJnt58ApysedXcvNUAy6FhgBIbDmPfq9d79qF4yQ';
const endlessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjB9.JWKPB-5Q8rTYzl-MfhRGpP9WpDpQxC7JkIAGFMDZnpg';
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Vg30C57s3l90JNap_VgMhKZjfc-p7SoBXaSAy8c28HA';

describe('isTokenExpired', () => {
  it('should return true if expired', async () => {
    const result = auth.isTokenExpired(expiredToken);
    expect(result).toBeTruthy();
  });

  it('should return false if no expiry', () => {
    const result = auth.isTokenExpired(endlessToken);
    expect(result).toBeFalsy();
  });

  it('should return false if not expired yet', () => {
    const result = auth.isTokenExpired(validToken);
    expect(result).toBeFalsy();
  });
});

describe('isRenewable', () => {
  it('should return false if expired', async () => {
    const result = auth.isRenewable(expiredToken);
    expect(result).toBeFalsy();
  });

  it('should return true if no expiry', () => {
    const result = auth.isRenewable(endlessToken);
    expect(result).toBeTruthy();
  });

  it('should return true if not expired yet', () => {
    const result = auth.isRenewable(validToken);
    expect(result).toBeTruthy();
  });
});

describe('renew', () => {
  const url = 'http://token.endpoint';
  const discovery = {
    token_endpoint: url,
    scopes_supported: ['openid', 'offline_access'],
  };

  const spy = vi.spyOn(utils, 'getOidcDiscovery');

  afterEach(() => {
    spy.mockClear();
  });

  it('should return new access and refresh tokens', async () => {
    utils.getOidcDiscovery.mockResolvedValue(discovery);
    mockAxios.onPost(url).reply(200, {
      access_token: validToken,
      refresh_token: endlessToken
    });

    const result = await auth.renew(endlessToken);

    expect(result).toBeTruthy();
    expect(result.jwt).toEqual(validToken);
    expect(result.refreshToken).toEqual(endlessToken);
    //expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });

  it('should gracefully return the error response', async () => {
    utils.getOidcDiscovery.mockResolvedValue(discovery);
    mockAxios.onPost(url).reply(400, {
      error: 'invalid_grant',
      error_description: 'Maximum allowed refresh token reuse exceeded'
    });

    const result = await auth.renew(endlessToken);

    expect(result).toBeTruthy();
    expect(result.error).toEqual('invalid_grant');
    expect(result.error_description).toEqual('Maximum allowed refresh token reuse exceeded');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });
});

describe('refreshJWT', () => {
  const spy = vi.spyOn(auth, 'renew');

  afterEach(() => {
    spy.mockClear();
  });

  it('should not have a user if no user or jwt exists', async () => {
    const result = await auth.refreshJWT({}, null, () => {});
    expect(result).toBeUndefined();
  });

  it('should not have a user if jwt is still valid', async () => {
    const result = await auth.refreshJWT({
      user: {
        jwt: validToken,
        refreshToken: endlessToken
      }
    }, null, () => {});
    expect(result).toBeUndefined();
  });

  it('should not have a user if jwt and refresh token are expired', async () => {
    const result = await auth.refreshJWT({
      user: {
        jwt: expiredToken,
        refreshToken: expiredToken
      }
    }, null, () => {});
    expect(result).toBeUndefined();
  });
});
/*
describe('getApiJwt', () => {
  const apiToken = auth.getApiJwt('fakeClient', 'fakeSecret');
  expect(apiToken).toBeTruthy();
});
describe('generateUiToken', () => {
  var s = 'user@penrequest.ca';
  var a  = config.get('server:frontend');
  const verifyOptions = {
    issuer:  config.get('tokenGenerate:issuer'),
    subject:  s,
    audience:  a,
    expiresIn:  '12h',
    algorithm:  ['RS256']
  };
  const token = auth.generateUiToken();

  const verified = jsonwebtoken.verify(token, config.get('tokenGenerate:publicKey'), verifyOptions);

  expect(verified).toBeTruthy();
});
*/
