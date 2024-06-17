import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import qs from 'querystring';
import HttpStatus from 'http-status-codes';
import lodash from 'lodash'

import { ApiError } from './error.js';
import { getOidcDiscovery, prettyStringify } from './utils.js';
import log from './logger.js';
import config from '../config/index.js';

const { pick } = lodash;

// Check if JWT Access Token has expired
export function isTokenExpired(token) {
  const now = Date.now().valueOf() / 1000;
  const payload = jsonwebtoken.decode(token);

  return (!!payload['exp'] && payload['exp'] < (now + 30)); // Add 30 seconds to make sure , edge case is avoided and token is refreshed.
}

// Check if JWT Refresh Token has expired
export function isRenewable(token) {
  const now = Date.now().valueOf() / 1000;
  const payload = jsonwebtoken.decode(token);

  // Check if expiration exists, or lacks expiration
  return (typeof (payload.exp) !== 'undefined' && payload.exp !== null &&
    payload.exp === 0 || payload.exp > now);
}

// Get new JWT and Refresh tokens
export async function renew(refreshToken) {
  let result = {};

  try {
    const discovery = await getOidcDiscovery();
    const response = await axios.post(discovery.token_endpoint,
      qs.stringify({
        client_id: config.get('oidc:clientId'),
        client_secret: config.get('oidc:clientSecret'),
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: discovery.scopes_supported
      }), {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    log.verbose('renew', prettyStringify(response.data));
    if(response && response.data && response.data.access_token && response.data.refresh_token){
      result.jwt = response.data.access_token;
      result.refreshToken = response.data.refresh_token;
    } else {
      log.error('Access token or refresh token not retreived properly');
    }
  } catch (error) {
    log.error('renew', error.message);
    result = error.response && error.response.data;
    //window.location.redirect = config.get('server:frontend') + '/api/auth/logout';
  }

  return result;
}

// Update or remove token based on JWT and user state
export async function refreshJWT(req, _res, next) {
  try {
    if (!!req && !!req.user && !!req.user.jwt) {
      log.verbose('refreshJWT', 'User & JWT exists');

      if (isTokenExpired(req.user.jwt)) {
        log.verbose('refreshJWT', 'JWT has expired');

        if (!!req.user.refreshToken && isRenewable(req.user.refreshToken)) {
          log.verbose('refreshJWT', 'Can refresh JWT token');

          // Get new JWT and Refresh Tokens and update the request
          const result = await renew(req.user.refreshToken);
          req.user.jwt = result.jwt; // eslint-disable-line require-atomic-updates
          req.user.refreshToken = result.refreshToken; // eslint-disable-line require-atomic-updates
        } else {
          log.verbose('refreshJWT', 'Cannot refresh JWT token');
          delete req.user;
        }
      }
    } else {
      log.verbose('refreshJWT', 'No existing User or JWT');
      delete req.user;
    }
  } catch (error) {
    log.error('refreshJWT', error.message);
  }
  next();
}

export function generateUiToken() {
  const i  = config.get('tokenGenerate:issuer');
  const s = 'user@penrequest.ca';
  const a  = config.get('server:frontend');
  const signOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: '30m',
    algorithm: 'RS256'
  };

  const privateKey = config.get('tokenGenerate:privateKey');
  const uiToken = jsonwebtoken.sign({}, privateKey, signOptions);
  log.verbose('Generated JWT', uiToken);
  return uiToken;
}
export async function getApiCredentials(clientId, clientSecret) {
  try {
    const discovery = await getOidcDiscovery();
    const response = await axios.post(discovery.token_endpoint,
      qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: discovery.scopes_supported
      }), {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    log.verbose('getApiCredentials Res', prettyStringify(response.data));

    let result = {};
    result.accessToken = response.data.access_token;
    result.refreshToken = response.data.refresh_token;
    return result;
  } catch (error) {
    log.error('getApiCredentials Error', error.response ? pick(error.response, ['status', 'statusText', 'data']) : error.message);
    const status = error.response ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'Get getApiCredentials error'}, error);
  }
}

export function isValidBackendToken() {
  return function (req, res, next) {
    if (req?.session?.passport?.user?.jwt) {
      try {
        jsonwebtoken.verify(req.session.passport.user.jwt, config.get('oidc:publicKey'));
      } catch (e) {
        log.debug('error is from verify', e);
        return res.status(HttpStatus.UNAUTHORIZED).json();
      }
      log.silly('Backend token is valid moving to next');
      return next();
    } else {
      log.silly(req.session);
      log.silly('no jwt responding back 401');
      return res.status(HttpStatus.UNAUTHORIZED).json();
    }
  };
}
