'use strict';

const config = require('../config/index');
const passport = require('passport');
const express = require('express');
const auth = require('../components/auth');
const { computeSMRetUrl } = require('../components/utils');
const {
  body,
  validationResult
} = require('express-validator');
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
router.get('/logout', async (req, res) => {
  if (req && req.user && req.user.jwt) {
    const token = req.user.jwt;
    req.logout();
    req.session.destroy();
    let siteMinderRetUrl = computeSMRetUrl(req, token);
    const siteMinderLogoutUrl = config.get('siteMinder_logout_endpoint');
    res.redirect(`${siteMinderLogoutUrl}${siteMinderRetUrl}`);

  } else {
    if (req.user) {
      const refresh = await auth.renew(req.user.refreshToken);
      req.logout();
      req.session.destroy();
      let siteMinderRetUrl = computeSMRetUrl(req, refresh.jwt);
      const siteMinderLogoutUrl = config.get('siteMinder_logout_endpoint');
      res.redirect(`${siteMinderLogoutUrl}${siteMinderRetUrl}`);
    } else {
      req.logout();
      req.session.destroy();
      let retUrl;
      if (req.query && req.query.sessionExpired) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/session-expired');
      } else if (req.query && req.query.loginError) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/login-error');
      } else if (req.query && req.query.loginBcsc) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc');
      } else if (req.query && req.query.loginBcscGMP) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc_gmp');
      } else if (req.query && req.query.loginBcscUMP) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bcsc_ump');
      } else if (req.query && req.query.loginBceid) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid');
      } else if (req.query && req.query.loginBceidGMP) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid_gmp');
      } else if (req.query && req.query.loginBceidUMP) {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/api/auth/login_bceid_ump');
      } else {
        retUrl = encodeURIComponent(config.get('logoutEndpoint') + '?post_logout_redirect_uri=' + config.get('server:frontend') + '/logout');
      }
      res.redirect(config.get('siteMinder_logout_endpoint')+ retUrl);
    }
  }
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
  if(!req || !req.user || !req.user.refreshToken){
    res.status(401).json(UnauthorizedRsp);
  } else {
    if (auth.isTokenExpired(req.user.jwt)) {
      const result = await auth.renew(req.user.refreshToken);
      if (result && result.jwt && result.refreshToken) {
        req.user.jwt = result.jwt;
        req.user.refreshToken = result.refreshToken;
        const responseJson = {
          jwtFrontend: auth.generateUiToken()
        };
        res.status(200).json(responseJson);
      } else {
        res.status(401).json(UnauthorizedRsp);
      }
    }else {
      const responseJson = {
        jwtFrontend: req.user.jwtFrontend
      };
      return res.status(200).json(responseJson);
    }
  }
});

//provides a jwt to authenticated users
router.use('/token', auth.refreshJWT, (req, res) => {
  if (req.user && req.user.jwtFrontend && req.user.refreshToken) {
    const responseJson = {
      jwtFrontend: req.user.jwtFrontend
    };
    res.status(200).json(responseJson);
  } else {
    res.status(401).json(UnauthorizedRsp);
  }
});

module.exports = router;
