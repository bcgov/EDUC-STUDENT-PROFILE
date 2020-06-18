'use strict';

const axios = require('axios');
const config = require('../config/index');
const log = require('./logger');
const HttpStatus = require('http-status-codes');
const lodash = require('lodash');
const { ApiError } = require('./error');
const jsonwebtoken = require('jsonwebtoken');
let discovery = null;

// Returns OIDC Discovery values
async function getOidcDiscovery() {
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

function minify(obj, keys=['documentData']) {
  return lodash.transform(obj, (result, value, key) => 
    result[key] = keys.includes(key) && lodash.isString(value) ? value.substring(0,1) + ' ...' : value );
}

function getSessionUser(req) {
  log.verbose('getSessionUser', req.session);
  const session = req.session;
  return session && session.passport && session.passport.user;
}

function getAccessToken(req) {
  const user = getSessionUser(req);
  return user && user.jwt;
}

async function deleteData(token, url) {
  try{
    const delConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    log.info('delete Data Url', url);
    const response = await axios.delete(url, delConfig);
    log.info('delete Data Status', response.status);
    log.info('delete Data StatusText', response.statusText);
    log.verbose('delete Data Res', response.data);

    return response.data;
  } catch (e) {
    log.error('deleteData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Delete error'}, e);
  }
}

async function forwardGetReq(req, res, url) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    log.info('forwardGetReq Url', url);
    const data = await getData(accessToken, url);
    return res.status(HttpStatus.OK).json(data);
  } catch (e) {
    log.error('forwardGetReq Error', e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Forward Get error'
    });
  }
}

async function getData(token, url) {
  try{
    const getDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    log.info('get Data Url', url);
    const response = await axios.get(url, getDataConfig);
    log.info('get Data Status', response.status);
    log.info('get Data StatusText', response.statusText);
    log.verbose('get Data Res', minify(response.data));

    return response.data;
  } catch (e) {
    log.error('getData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Get error'}, e);
  }
}

async function getDataWithParams(token, url, params) {
  try{
    params.headers = {
      Authorization: `Bearer ${token}`,
    };

    log.info('get Data Url', url);
    const response = await axios.get(url, params);
    log.info('get Data Status', response.status);
    log.info('get Data StatusText', response.statusText);
    log.verbose('get Data Res', minify(response.data));

    return response.data;
  } catch (e) {
    log.error('getDataWithParams Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Get error'}, e);
  }
}

async function forwardPostReq(req, res, url) {
  try{
    const accessToken = getAccessToken(req);
    if(!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }

    const data = await postData(accessToken, req.body, url);
    return res.status(HttpStatus.OK).json(data);
  } catch(e) {
    log.error('forwardPostReq Error', e.stack);
    return res.status(e.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Forward Post error'
    });
  }
}

async function postData(token, data, url) {
  try{
    const postDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    log.info('post Data Url', url);
    log.verbose('post Data Req', minify(data));
    data.createUser='STUDENT-PROFILE';
    data.updateUser='STUDENT-PROFILE';
    const response = await axios.post(url, data, postDataConfig);

    log.info('post Data Status', response.status);
    log.info('post Data StatusText', response.statusText);

    log.verbose('post Data Res', response.data);

    return response.data;
  } catch(e) {
    log.error('postData Error', e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Post error'}, e);
  }
}

async function putData(token, data, url) {
  try{
    const putDataConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    log.info('put Data Url', url);
    log.verbose('put Data Req', data);
    data.updateUser='STUDENT-PROFILE';
    const response = await axios.put(url, data, putDataConfig);

    log.info('put Data Status', response.status);
    log.info('put Data StatusText', response.statusText);

    log.verbose('put Data Res', response.data);

    return response.data;
  } catch(e) {
    log.error('putData Error',  e.response ? e.response.status : e.message);
    const status = e.response ? e.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
    throw new ApiError(status, { message: 'API Put error'}, e);
  }
}

const RequestStatuses = Object.freeze({
  DRAFT: 'DRAFT',
  INITREV: 'INITREV',
  RETURNED: 'RETURNED',
  SUBSREV: 'SUBSREV',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  ABANDONED: 'ABANDONED'
});

const EmailVerificationStatuses = Object.freeze({
  VERIFIED: 'Y',
  NOT_VERIFIED: 'N'
});

const VerificationResults = Object.freeze({
  TOKEN_ERROR: 'token-error',
  SERVER_ERROR: 'server-error',
  EXPIRED: 'expired',
  OK: 'ok'
});

function computeSMRetUrl(req, token) {
  let siteMinderRetUrl;
  if (req.query && req.query.sessionExpired) {
    siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend') + '/session-expired');
  } else if (req.query && req.query.loginError) {
    siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend') + '/login-error');
  } else if (req.query && req.query.loginBcsc) {
    siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc');
  } else if (req.query && req.query.loginBceid) {
    siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid');
  } else {
    siteMinderRetUrl = encodeURIComponent(config.get('logoutEndpoint') + '?id_token_hint=' + token + '&post_logout_redirect_uri=' + config.get('server:frontend') + '/logout');
  }
  return siteMinderRetUrl;
}
function generateJWTToken(jwtid, subject, issuer, algorithm, payload) {

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

const utils = {
  getOidcDiscovery,
  prettyStringify: (obj, indent = 2) => JSON.stringify(obj, null, indent),
  getSessionUser,
  getAccessToken,
  deleteData,
  forwardGetReq,
  getDataWithParams,
  getData,
  forwardPostReq,
  postData,
  putData,
  RequestStatuses,
  VerificationResults,
  EmailVerificationStatuses,
  computeSMRetUrl,
  generateJWTToken
};

module.exports = utils;
