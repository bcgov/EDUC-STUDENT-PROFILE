import express from 'express';
import HttpStatus from 'http-status-codes';
import config from '../config/index.js';

const router = express.Router();

router.get('/', getConfig);

async function getConfig(_req, res) {
  return res.status(HttpStatus.OK).json({
    scheduler: { numDaysAllowedInDraftStatus: config.get('scheduler:numDaysAllowedInDraftStatus') },
    frontendConfig: config.get('frontendConfig')
  });
}

export default router;
