import passport from 'passport';
import express from 'express';

import { getUserInfo } from '../components/requestHandler.js';
import { isValidBackendToken } from '../components/auth.js';

const router = express.Router();
router.get('/', passport.authenticate('jwt', {session: false}), isValidBackendToken(), getUserInfo);

export default router;
