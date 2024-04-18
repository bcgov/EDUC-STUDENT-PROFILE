const express = require('express');
const HttpStatus = require('http-status-codes');
const config = require('../config/index');
const log = require('../components/logger');
const router = express.Router();

router.get('/', getConfig);

async function getConfig(req, res) {
  const configName = req.query.configName;
  log.silly(`query param for config is ${configName}`);
  if (configName) {
    const validKeys = [
      'scheduler:numDaysAllowedInDraftStatus',
      'frontendConfig'
    ];
    if (!validKeys.includes(configName)) {
      return res.status(HttpStatus.BAD_REQUEST).json();
    }

    const responseObject = {
      configValue: config.get(`${configName}`)
    };

    log.silly(`response for config is ${JSON.stringify(responseObject)}`);
    return res.status(HttpStatus.OK).json(responseObject);
  }
  return res.status(HttpStatus.OK).json(); // return blank response.
}

module.exports = router;
