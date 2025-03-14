import nconf from 'nconf';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, URL } from 'url';

dotenv.config();

const env = process.env.NODE_ENV || 'local';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

nconf.argv().env().file({ file: path.join(__dirname, `${env}.json`) });

//injects environment variables into the json file
nconf.overrides({
  environment: env,

  server: {
    logLevel: process.env.LOG_LEVEL,
    morganFormat: 'dev',
    port: 8080
  }
});

export default nconf.defaults({
  environment: env,
  logoutEndpoint:
    process.env.SOAM_URL + '/auth/realms/master/protocol/openid-connect/logout',
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
  studentRequest: {
    apiEndpoint: process.env.STUDENT_PROFILE_API_ENDPOINT,
    replicateTime: process.env.STUDENT_PROFILE_REPLICATE_TIME || 8,
    commentSagaEndpoint: '/student-profile-comment-saga'
  },
  penRequest: {
    apiEndpoint: process.env.PEN_REQUEST_API_ENDPOINT,
    replicateTime: process.env.PEN_REQUEST_REPLICATE_TIME || 8,
    commentSagaEndpoint: '/pen-request-comment-saga'
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
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
  scheduler :{
    schedulerCronProfileRequestDraft: process.env.SCHEDULER_CRON_PROFILE_REQUEST_DRAFT,
    numDaysAllowedInDraftStatus: process.env.NUM_DAYS_ALLOWED_IN_DRAFT_STATUS,
    expectedDraftRequests: process.env.EXPECTED_DRAFT_REQUESTS,
    numDaysAllowedInReturnStatusBeforeEmail: process.env.NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_EMAIL,
    numDaysAllowedInReturnStatusBeforeAbandoned: process.env.NUM_DAYS_ALLOWED_IN_RETURN_STATUS_BEFORE_ABANDONED,
    schedulerCronStaleSagaRecordRedis: process.env.SCHEDULER_CRON_STALE_SAGA_RECORD_REDIS,
    minTimeBeforeSagaIsStaleInMinutes: process.env.MIN_TIME_BEFORE_SAGA_IS_STALE_IN_MINUTES
  },
  frontendConfig: {
    bannerEnvironment: process.env.BANNER_ENVIRONMENT,
    bannerColor: process.env.BANNER_COLOR,
    bceidRegUrl: process.env.BCEID_REG_URL,
    idleTimeoutInMillis: process.env.IDLE_TIMEOUT_IN_MILLIS,
    journeyBuilder: process.env.JOURNEY_BUILDER
  },
  profileSagaAPIURL: process.env.PROFILE_REQUEST_SAGA_API_URL,
  messaging: {
    natsUrl: process.env.NATS_URL,
    natsCluster: process.env.NATS_CLUSTER
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED || false,
    windowInSec: process.env.RATE_LIMIT_WINDOW_IN_SEC || 60,
    limit: process.env.RATE_LIMIT_LIMIT || 100
  }
});
