import axios from 'axios';
import HttpStatus from 'http-status-codes';
import lodash from 'lodash';
import jsonwebtoken from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { LocalDateTime, DateTimeFormatter } from '@js-joda/core';
import { Locale } from '@js-joda/locale_en';
import { validate } from 'uuid';

import config from '../config/index.js';
import { ApiError } from './error.js';
import log from './logger.js';

let discovery = null;

export function setDiscovery(value) {
  discovery = value;
}

export function getDiscovery() {
  return discovery;
}

axios.interceptors.request.use((axiosRequestConfig) => {
  axiosRequestConfig.headers['X-Client-Name'] = 'PEN-STUDENT-PROFILE';
  return axiosRequestConfig;
});

// Returns OIDC Discovery values
export async function getOidcDiscovery() {
  if (!discovery) {
    try {
      const response = await axios.get(config.get('oidc:discovery'));
      discovery = response.data;
    } catch (error) {
      log.error('getOidcDiscovery', `OIDC Discovery failed - ${error.message}`);
    }
  }
  return discovery;
}

export function minify(obj, keys = ['documentData']) {
  return lodash.transform(obj, (result, value, key) =>
    result[key] = keys.includes(key) && lodash.isString(value) ? value.substring(0, 1) + ' ...' : value);
}

export function getSessionUser(req) {
  log.verbose('getSessionUser', req.session);
  const session = req.session;
  return session && session.passport && session.passport.user;
}

export function getAccessToken(req) {
  const user = getSessionUser(req);
  return user && user.jwt;
}

export async function deleteData(token, url, correlationID) {
  try {
    const delConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      }
    };

    log.info('delete Data Url', url);
    const response = await axios.delete(url, delConfig);
    log.info(`delete Data Status for url ${url} :: is :: `, response.status);
    log.info(`delete Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`delete Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('deleteData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Delete error'}, e);
  }
}

export async function forwardGetReq(req, res, url) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    log.info('forwardGetReq Url', url);
    const data = await getData(accessToken, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('forwardGetReq Error', e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Forward Get error'
    });
  }
}

export async function getData(token, url, correlationID) {
  try {
    const getDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      }
    };

    log.info('get Data Url', url);
    const response = await axios.get(url, getDataConfig);
    log.info(`get Data Status for url ${url} :: is :: `, response.status);
    log.info(`get Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`get Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('getData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Get error'}, e);
  }
}

export async function getDataWithParams(token, url, params, correlationID) {
  try {
    params.headers = {
      Authorization: `Bearer ${token}`,
      correlationID: correlationID || uuidv4()
    };

    log.info('get Data Url', url);
    const response = await axios.get(url, params);
    log.info(`get Data Status for url ${url} :: is :: `, response.status);
    log.info(`get Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`get Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('getDataWithParams Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Get error'}, e);
  }
}

export async function forwardPostReq(req, res, url) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }

    const data = await postData(accessToken, req.body, url, req.session?.correlationID);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('forwardPostReq Error', e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Forward Post error'
    });
  }
}

export async function postData(token, data, url, correlationID) {
  try {
    const postDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    };

    log.info('post Data Url', url);
    log.verbose('post Data Req', minify(data));
    data.createUser = 'STUDENT-PROFILE';
    data.updateUser = 'STUDENT-PROFILE';
    const response = await axios.post(url, data, postDataConfig);

    log.info(`post Data Status for url ${url} :: is :: `, response.status);
    log.info(`post Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`post Data Response for url ${url}  :: is :: `, typeof response.data === 'string' ? response.data : minify(response.data));

    return response.data;
  } catch (e) {
    log.error('postData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Post error'}, e);
  }
}

export async function putData(token, data, url, correlationID) {
  try {
    const putDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        correlationID: correlationID || uuidv4()
      }
    };

    log.info('put Data Url', url);
    log.verbose('put Data Req', data);
    data.updateUser = 'STUDENT-PROFILE';
    const response = await axios.put(url, data, putDataConfig);

    log.info(`put Data Status for url ${url} :: is :: `, response.status);
    log.info(`put Data StatusText for url ${url}  :: is :: `, response.statusText);
    log.verbose(`put Data Response for url ${url}  :: is :: `, minify(response.data));

    return response.data;
  } catch (e) {
    log.error('putData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, {message: 'API Put error'}, e);
  }
}

export const RequestStatuses = Object.freeze({
  DRAFT: 'DRAFT',
  INITREV: 'INITREV',
  RETURNED: 'RETURNED',
  SUBSREV: 'SUBSREV',
  REJECTED: 'REJECTED',
  ABANDONED: 'ABANDONED'
});

export const EmailVerificationStatuses = Object.freeze({
  VERIFIED: 'Y',
  NOT_VERIFIED: 'N'
});

export const VerificationResults = Object.freeze({
  TOKEN_ERROR: 'token-error',
  SERVER_ERROR: 'server-error',
  EXPIRED: 'expired',
  OK: 'ok'
});

export const RequestApps = Object.freeze({
  penRequest: 'gmp',
  studentRequest: 'ump'
});

export function generateJWTToken(jwtid, subject, issuer, algorithm, payload) {
  const tokenTTL = config.get('email:tokenTTL'); // this should be in minutes
  const jwtSecretKey = config.get('email:secretKey');

  let sign_options_schema = {
    expiresIn: tokenTTL * 60,
    algorithm: algorithm,
    issuer: issuer,
    jwtid: jwtid,
    subject: subject
  };

  return jsonwebtoken.sign(payload, jwtSecretKey, sign_options_schema);
}

export function formatCommentTimestamp(time) {
  const timestamp = LocalDateTime.parse(time);
  return timestamp.format(DateTimeFormatter.ofPattern('yyyy-MM-dd h:mma').withLocale(Locale.CANADA));
}

export function prettyStringify(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

export function getStudent(userInfo) {
  return {
    studentID: userInfo._json.studentID,
    pen: userInfo._json.pen,
    legalLastName: userInfo._json.legalLastName,
    legalFirstName: userInfo._json.legalFirstName || null,
    legalMiddleNames: userInfo._json.legalMiddleNames || null,
    email: userInfo._json.email || null,
    dob: new Date(userInfo._json.dob).toJSON().slice(0, 10),
  };
}

export function getDefaultBcscInput(userInfo) {
  let middleNames = '';
  if(userInfo._json.givenNames) {
    let givenArray = (userInfo._json.givenNames).split(' ');
    givenArray.shift();
    middleNames = givenArray.join(' ');
  }
  return {
    legalLastName: userInfo._json.surname,
    legalFirstName: userInfo._json.givenName,
    legalMiddleNames: middleNames,
    email: userInfo._json.email,
    dob: userInfo._json.birthDate
  };
}

export function isValidStringParam(paramName) {
  return function(req, res, next) {
    if (!req.params[paramName]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No request parameter was provided.'
      });
    }
    if (typeof req.params[paramName] !== 'string') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Not a valid string'
      });
    }
    return next();
  };
}

export function isValidUUIDParam(paramName) {
  return function(req, res, next) {
    if (!req.params[paramName]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No request parameter was provided.'
      });
    }

    if (!validate(req.params[paramName])) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Not a valid UUID provided for request parameter.'
      });
    }
    return next();
  };
}

export function isValidUUIDQueryParam(paramName) {
  return function(req, res, next) {
    if (!req.query[paramName]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'No query parameter was provided.'
      });
    }
    if (!validate(req.query[paramName])) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Not a valid UUID provided for query parameter.'
      });
    }
    return next();
  };
}
