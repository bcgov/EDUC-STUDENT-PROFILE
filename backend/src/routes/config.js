const express = require('express');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const router = express.Router();

router.get('/', getConfig);

async function getConfig(_req, res) {
  return res.status(HttpStatus.OK).json({
    scheduler: { numDaysAllowedInDraftStatus: config.get('scheduler:numDaysAllowedInDraftStatus') },
    frontendConfig: config.get('frontendConfig')
  });
}

module.exports = router;
