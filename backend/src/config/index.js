'use strict';
const nconf = require('nconf');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const env = process.env.NODE_ENV;

nconf.argv()
  .env()
  .file({ file: path.join(__dirname, `${env}.json`) });

//injects environment variables into the json file
nconf.overrides({
  environment: env,

  server: {
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080
  }
});



nconf.defaults({
  environment: env,
  logoutEndpoint: process.env.SOAM_URL + '/auth/realms/master/protocol/openid-connect/logout',
  siteMinder_logout_endpoint: process.env.SITEMINDER_LOGOUT_ENDPOINT,
  server: {
    frontend: process.env.SERVER_FRONTEND,
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080
  },
  oidc: {
    publicKey: process.env.SOAM_PUBLIC_KEY,
    clientId: process.env.SOAM_CLIENT_ID,
    clientSecret: process.env.SOAM_CLIENT_SECRET,
    discovery: process.env.SOAM_DISCOVERY
  },
  studentProfile: {
    apiEndpoint: process.env.STUDENT_PROFILE_API_ENDPOINT,
    clientId: process.env.STUDENT_PROFILE_CLIENT_ID,
    clientSecret: process.env.STUDENT_PROFILE_CLIENT_SECRET,
    replicateTime: process.env.PEN_REQUEST_REPLICATE_TIME || 8,
  },
  tokenGenerate: {
    privateKey: process.env.UI_PRIVATE_KEY,
    publicKey: process.env.UI_PUBLIC_KEY,
    audience: process.env.SERVER_FRONTEND,
    issuer: process.env.ISSUER
  },
  digitalID: {
    apiEndpoint: process.env.DIGITALID_API_ENDPOINT,
  },
  student: {
    apiEndpoint: process.env.STUDENT_API_ENDPOINT,
  },
  email: {
    apiEndpoint: process.env.STUDENT_PROFILE_EMAIL_API_ENDPOINT,
    secretKey: process.env.STUDENT_PROFILE_EMAIL_SECRET_KEY,
    tokenTTL: process.env.TOKEN_TTL_MINUTES
  },
  demographics: {
    apiEndpoint: process.env.STUDENT_DEMOG_API_ENDPOINT,
  },
  redis:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD
  },
  scheduler :{
    schedulerCronProfileRequestDraft:process.env.SCHEDULER_CRON_PROFILE_REQUEST_DRAFT,
    numDaysAllowedInDraftStatus:process.env.NUM_DAYS_ALLOWED_IN_DRAFT_STATUS,
    expectedDraftRequests: process.env.EXPECTED_DRAFT_REQUESTS,
  }
});
module.exports = nconf;
