'use strict';

const config = require('./config/index');
const dotenv = require('dotenv');
const log = require('npmlog');
const morgan = require('morgan');
const session = require('express-session');
const express = require('express');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const utils = require('./components/utils');
const auth = require('./components/auth');
const bodyParser = require('body-parser');
const redis = require('redis');
const connectRedis = require('connect-redis');
dotenv.config();

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const OidcStrategy = require('passport-openidconnect-kc-idp').Strategy;

const apiRouter = express.Router();
const authRouter = require('./routes/auth');
const studentRouter = require('./routes/student');

//initialize app
const app = express();
app.set('trust proxy', 1);
//sets security measures (headers, etc)
app.use(cors());
app.use(helmet());
app.use(helmet.noCache());
//tells the app to use json as means of transporting data
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));


app.use(morgan(config.get('server:morganFormat')));
const redisClient = redis.createClient({
  host: config.get('redis:host'),
  port: config.get('redis:port'),
  password: config.get('redis:password')
});
const RedisStore = connectRedis(session);
const dbSession = new RedisStore({
  client: redisClient,
  prefix: 'student-profile-sess:',
});
redisClient.on('error', (error)=>{
  log.error(`error occurred in redis client. ${error}`);
});
const cookie = {
  secure: true,
  httpOnly: true,
  maxAge: 1800000 //30 minutes in ms. this is same as session time. DO NOT MODIFY, IF MODIFIED, MAKE SURE SAME AS SESSION TIME OUT VALUE.
};
if (config.get('environment') !== undefined && config.get('environment') === 'local') {
  cookie.secure = false;
}
//sets cookies for security purposes (prevent cookie access, allow secure connections only, etc)
app.use(session({
  name: 'student_profile_cookie',
  secret: config.get('oidc:clientSecret'),
  resave: false,
  saveUninitialized: true,
  cookie: cookie,
  store: dbSession
}));

//initialize routing and session. Cookies are now only reachable via requests (not js)
app.use(passport.initialize());
app.use(passport.session());

//configure logging
log.level = config.get('server:logLevel');
log.addLevel('debug', 1500, {
  fg: 'cyan'
});

//initialize our authentication strategy
utils.getOidcDiscovery().then(discovery => {
  //OIDC Strategy is used for authorization
  passport.use('oidcBcsc', new OidcStrategy({
    issuer: discovery.issuer,
    authorizationURL: discovery.authorization_endpoint,
    tokenURL: discovery.token_endpoint,
    userInfoURL: discovery.userinfo_endpoint,
    clientID: config.get('oidc:clientId'),
    clientSecret: config.get('oidc:clientSecret'),
    callbackURL: config.get('server:frontend') + '/api/auth/callback_bcsc',
    scope: discovery.scopes_supported,
    kc_idp_hint: 'keycloak_bcdevexchange_bcsc'
  }, (_issuer, _sub, profile, accessToken, refreshToken, done) => {
    if ((typeof (accessToken) === 'undefined') || (accessToken === null) ||
      (typeof (refreshToken) === 'undefined') || (refreshToken === null)) {
      return done('No access token', null);
    }

    //set access and refresh tokens
    profile.jwtFrontend = auth.generateUiToken();
    profile.jwt = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
  }));

  passport.use('oidcBceid', new OidcStrategy({
    issuer: discovery.issuer,
    authorizationURL: discovery.authorization_endpoint,
    tokenURL: discovery.token_endpoint,
    userInfoURL: discovery.userinfo_endpoint,
    clientID: config.get('oidc:clientId'),
    clientSecret: config.get('oidc:clientSecret'),
    callbackURL: config.get('server:frontend') + '/api/auth/callback_bceid',
    scope: discovery.scopes_supported,
    kc_idp_hint: 'keycloak_bcdevexchange_bceid'
  }, (_issuer, _sub, profile, accessToken, refreshToken, done) => {
    if ((typeof (accessToken) === 'undefined') || (accessToken === null) ||
      (typeof (refreshToken) === 'undefined') || (refreshToken === null)) {
      return done('No access token', null);
    }

    //set access and refresh tokens
    profile.jwtFrontend = auth.generateUiToken();
    profile.jwt = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
  }));
  //JWT strategy is used for authorization
  passport.use('jwt', new JWTStrategy({
    algorithms: ['RS256'],
    // Keycloak 7.3.0 no longer automatically supplies matching client_id audience.
    // If audience checking is needed, check the following SO to update Keycloak first.
    // Ref: https://stackoverflow.com/a/53627747
    audience: config.get('server:frontend'),
    issuer: config.get('tokenGenerate:issuer'),
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('tokenGenerate:publicKey')
  }, (jwtPayload, done) => {
    if ((typeof (jwtPayload) === 'undefined') || (jwtPayload === null)) {
      return done('No JWT token', null);
    }

    done(null, {
      email: jwtPayload.email,
      familyName: jwtPayload.family_name,
      givenName: jwtPayload.given_name,
      jwt: jwtPayload,
      name: jwtPayload.name,
      preferredUsername: jwtPayload.preferred_username,
      realmRole: jwtPayload.realm_role
    });
  }));
});
//functions for serializing/deserializing users
passport.serializeUser((user, next) => next(null, user));
passport.deserializeUser((obj, next) => next(null, obj));


// GetOK Base API Directory
apiRouter.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/api/auth',
      '/api/student'
    ],
    versions: [
      1
    ]
  });
});

// GetOK Base API for readiness and liveness probe
apiRouter.get('/health', (_req, res) => {
  res.status(200).json();
});

//set up routing to auth and main API
app.use(/(\/api)?/, apiRouter);

apiRouter.use('/auth', authRouter);
apiRouter.use('/student', studentRouter);

//Handle 500 error
app.use((err, _req, res, next) => {
  log.error(err.stack);
  res.redirect(config.get('server:frontend') + '/error?message=500_internal_error');
  next();
});

// Handle 404 error
app.use((_req, res) => {
  log.error('404 Error');
  res.redirect(config.get('server:frontend') + '/error?message=404_Page_Not_Found');
});

// Prevent unhandled errors from crashing application
process.on('unhandledRejection', err => {
  log.error('Unhandled Rejection at:', err.stack || err);
  // res.redirect(config.get('server:frontend') + '/error?message=unhandled_rejection');
});

module.exports = app;
