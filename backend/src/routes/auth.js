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
      '/callback_bceid',
      '/login',
      '/logout',
      '/refresh',
      '/token'
    ]
  });
});

//provides a callback location for the auth service
router.get('/callback_bcsc',
  passport.authenticate('oidcBcsc', {
    failureRedirect: 'error'
  }),
  (_req, res) => {
    res.redirect(config.get('server:frontend'));
  }
);

router.get('/callback_bceid',
  passport.authenticate('oidcBceid', {
    failureRedirect: 'error'
  }),
  (_req, res) => {
    res.redirect(config.get('server:frontend'));
  }
);

//a prettier way to handle errors
router.get('/error', (_req, res) => {
  res.redirect(config.get('server:frontend') + '/login-error');
});

//redirects to the SSO login screen
router.get('/login_bcsc', passport.authenticate('oidcBcsc', {
  failureRedirect: 'error'
}));

router.get('/login_bceid', passport.authenticate('oidcBceid', {
  failureRedirect: 'error'
}));

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
      if (req.query && req.query.sessionExpired) {
        res.redirect(config.get('server:frontend') + '/session-expired');
      } else if (req.query && req.query.loginError) {
        res.redirect(config.get('server:frontend') + '/login-error');
      } else if (req.query && req.query.loginBcsc) {
        res.redirect(config.get('server:frontend') + '/api/auth/login_bcsc');
      } else if (req.query && req.query.loginBceid) {
        res.redirect(config.get('server:frontend') + '/api/auth/login_bceid');
      } else {
        res.redirect(config.get('server:frontend') + '/logout');
      }
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
    const result = await auth.renew(req.user.refreshToken);
    if (result && result.jwt && result.refreshToken) {
      req.user.jwt = result.jwt;
      req.user.refreshToken = result.refreshToken;
      const responseJson = {
        jwtFrontend: auth.generateUiToken()
      };
      res.status(200).json(responseJson);
    }else {
      res.status(401).json(UnauthorizedRsp);
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
