const baseRoot = '/api';
const authRoot = baseRoot + '/auth';
const apiRoot = baseRoot + '/student';
let object;

object = {
  LOGIN:'/',
  LOGIN_BCSC: authRoot + '/logout?loginBcsc=true',
  LOGIN_BCEID: authRoot + '/logout?loginBceid=true',
  LOGOUT: authRoot + '/logout',
  SESSION_EXPIRED: authRoot + '/logout?sessionExpired=true',
  LOGIN_FAILED: authRoot + '/logout?loginError=true',
  REFRESH: authRoot + '/refresh',
  TOKEN: authRoot + '/token'
};
//Authentication endpoints
export const AuthRoutes = Object.freeze(object);

export const ApiRoutes = Object.freeze({
  REQUEST: apiRoot + '/request',
  CODES: apiRoot + '/codes',
  DOCUMENT_TYPE_CODES: apiRoot + '/document-type-codes',
  FILE_REQUIREMENTS: apiRoot + '/file-requirements',
  // FILE_UPLOAD: apiRoot + '/document',
  USER: apiRoot + '/user',
});

export const RequestStatuses = Object.freeze({
  DRAFT: 'DRAFT',
  INITREV: 'INITREV',
  RETURNED: 'RETURNED',
  SUBSREV: 'SUBSREV',
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
  REJECTED: 'REJECTED',
});

export const VerificationResults = Object.freeze({
  TOKEN_ERROR: 'token-error',
  SERVER_ERROR: 'server-error',
  EXPIRED: 'expired',
  OK: 'ok'
});
