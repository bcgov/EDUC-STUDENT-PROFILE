import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import passport from 'passport';
import express from 'express';

import config from '../config/index.js';
import * as auth from '../components/auth.js';
import log from '../components/logger.js';

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/callback_bcsc',
      '/callback_bcsc_gmp',
      '/callback_bcsc_ump',
      '/callback_bceid',
      '/callback_bceid_gmp',
      '/callback_bceid_ump',
      '/login',
      '/logout',
      '/refresh',
      '/token'
    ]
  });
});

function addOIDCRouterGet(strategyName, callbackURI, redirectURL) {
  router.get(callbackURI,
    passport.authenticate(strategyName, {
      failureRedirect: 'error'
    }),
    (_req, res) => {
      res.redirect(redirectURL);
    }
  );
}

addOIDCRouterGet('oidcBcsc', '/callback_bcsc', config.get('server:frontend'));
addOIDCRouterGet('oidcBcscGMP', '/callback_bcsc_gmp', config.get('server:frontend') + '/gmp');
addOIDCRouterGet('oidcBcscUMP', '/callback_bcsc_ump', config.get('server:frontend') + '/ump');
addOIDCRouterGet('oidcBceid', '/callback_bceid', config.get('server:frontend'));
addOIDCRouterGet('oidcBceidGMP', '/callback_bceid_gmp', config.get('server:frontend') + '/gmp');
addOIDCRouterGet('oidcBceidUMP', '/callback_bceid_ump', config.get('server:frontend') + '/ump');

//a prettier way to handle errors
router.get('/error', (_req, res) => {
  res.redirect(config.get('server:frontend') + '/login-error');
});

function addBaseRouterGet(strategyName, callbackURI) {
  router.get(callbackURI, passport.authenticate(strategyName, {
    scope: ['openid', 'profile'],
    failureRedirect: 'error'
  }));
}

addBaseRouterGet('oidcBcsc', '/login_bcsc');
addBaseRouterGet('oidcBcscGMP', '/login_bcsc_gmp');
addBaseRouterGet('oidcBcscUMP', '/login_bcsc_ump');
addBaseRouterGet('oidcBceid', '/login_bceid');
addBaseRouterGet('oidcBceidGMP', '/login_bceid_gmp');
addBaseRouterGet('oidcBceidUMP', '/login_bceid_ump');

//removes tokens and destroys session
router.get('/logout', async (req, res, next) => {
  let idToken = req?.session?.passport?.user?.idToken;

  const makeUrl = endpoint => {
    return encodeURIComponent(
      config.get('logoutEndpoint')
        + `?post_logout_redirect_uri=${config.get('server:frontend')}`
        + endpoint
        + (idToken ? `&id_token_hint=${idToken}` : `&client_id=${config.get('oidc:clientId')}`)
    );
  };

  let retUrl;
  req.logout(err => {
    if (err) return next(err);
    if (req?.query?.sessionExpired) {
      retUrl = makeUrl('/session-expired');
    } else if (req?.query?.loginError) {
      retUrl = makeUrl('/login-error');
    } else if (req?.query?.loginBcsc) {
      retUrl = makeUrl('/api/auth/login_bcsc');
    } else if (req?.query?.loginBcscGMP) {
      retUrl = makeUrl('/api/auth/login_bcsc_gmp');
    } else if (req?.query?.loginBcscUMP) {
      retUrl = makeUrl('/api/auth/login_bcsc_ump');
    } else if (req?.query?.loginBceid) {
      retUrl = makeUrl('/api/auth/login_bceid');
    } else if (req?.query?.loginBceidGMP) {
      retUrl = makeUrl('/api/auth/login_bceid_gmp');
    } else if (req?.query?.loginBceidUMP) {
      retUrl = makeUrl('/api/auth/login_bceid_ump');
    } else {
      retUrl = makeUrl('/logout');
    }
    res.redirect(config.get('siteMinder_logout_endpoint') + retUrl);
  });
});

const UnauthorizedRsp = {
  error: 'Unauthorized',
  error_description: 'Not logged in'
};

//refreshes jwt on refresh if refreshToken is valid
router.post('/refresh', [
  body('refreshToken').exists()
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  if (!req['user'] || !req['user'].refreshToken || !req?.user?.jwt) {
    res.status(401).json(UnauthorizedRsp);
  } else {
    if (auth.isTokenExpired(req.user.jwt)) {
      if (req?.user?.refreshToken && auth.isRenewable(req.user.refreshToken)) {
        return generateTokens(req, res);
      } else {
        res.status(401).json(UnauthorizedRsp);
      }
    } else {
      const responseJson = {
        jwtFrontend: req.user.jwtFrontend
      };
      return res.status(200).json(responseJson);
    }
  }
});

//provides a jwt to authenticated users
router.get('/token', auth.refreshJWT, (req, res) => {
  if (req?.user && req.user?.jwtFrontend && req.user?.refreshToken) {
    if (req.session?.passport?.user?._json) {
      const correlationID = uuidv4();
      req.session.correlationID = correlationID;
      const correlation = {
        user_guid: req.session?.passport?.user?._json.user_guid,
        correlation_id: correlationID
      };
      log.info('created correlation id and stored in session', correlation);
    }
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json(UnauthorizedRsp);
  }
});

async function generateTokens(req, res) {
  const result = await auth.renew(req.user.refreshToken);
  if (result && result.jwt && result.refreshToken) {
    req.user.jwt = result.jwt;
    req.user.refreshToken = result.refreshToken;
    req.user.jwtFrontend = auth.generateUiToken();
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json(UnauthorizedRsp);
  }
}
router.get('/user-session-remaining-time', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (req?.session?.cookie && req?.session?.passport?.user) {
    const remainingTime = req.session.cookie.maxAge;
    log.info(`session remaining time is :: ${remainingTime} for user`, req.session?.passport?.user?.displayName);
    return res.status(200).json(req.session.cookie.maxAge);
  } else {
    return res.sendStatus(401);
  }
});

export default router;
