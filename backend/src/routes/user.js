'use strict';

const passport = require('passport');
const express = require('express');
const { getUserInfo } = require('../components/request');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), getUserInfo);

module.exports = router;
