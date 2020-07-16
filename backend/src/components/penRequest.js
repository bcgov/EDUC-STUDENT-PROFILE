'use strict';

const { RequestStatuses,getAccessToken,postData,getSessionUser } = require('./utils');
const config = require('../config/index');
const localDateTime = require('@js-joda/core').LocalDateTime;
const ChronoUnit = require('@js-joda/core').ChronoUnit;
const HttpStatus = require('http-status-codes');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');

function setPenRequestReplicateStatus(penRequest) {
  if (penRequest.penRequestStatusCode === PenRequestStatuses.AUTO || penRequest.penRequestStatusCode === PenRequestStatuses.MANUAL) {
    let updateTime = localDateTime.parse(penRequest.statusUpdateDate);
    let replicateTime = updateTime.truncatedTo(ChronoUnit.HOURS).withHour(config.get('penRequest:replicateTime'));
    if (config.get('penRequest:replicateTime') <= updateTime.hour()) {
      replicateTime = replicateTime.plusDays(1);
    }
    penRequest.tomorrow = penRequest.demogChanged === 'Y' && replicateTime.isAfter(localDateTime.now());
  }
  return penRequest;
}

function verifyPenRequestStatus(penRequest) {
  return penRequest.penRequestStatusCode !== PenRequestStatuses.REJECTED && 
    penRequest.penRequestStatusCode !== PenRequestStatuses.ABANDONED;
}


const PenRequestStatuses = Object.freeze({
  ...RequestStatuses,
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
});

async function postComment(req, res) {
  try {
    const requestType = 'penRequest';
    const userInfo = getSessionUser(req);
    if(!userInfo._json || !userInfo._json.digitalIdentityID){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No session data'
      });
    }
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No access token'
      });
    }

    if (!req || !req.session || !req.session[requestType] || req.session[requestType][`${requestType}StatusCode`] !== RequestStatuses.RETURNED) {
      return res.status(HttpStatus.CONFLICT).json({
        message: `Post ${requestType} comment not allowed`
      });
    }

    const url = `${config.get('profileSagaAPIURL')}/pen-request-comment-saga`;
    const penRequestID = req.params.id;
    const payload = {
      penRetrievalRequestID: penRequestID,
      commentContent: req.body.content,
      commentTimestamp: localDateTime.now().toString().substr(0, 19),
      penRequestStatusCode: RequestStatuses.SUBSREV
    };
    const sagaId = await postData(accessToken, payload, url);
    const event = {
      sagaId: sagaId,
      penRequestID: penRequestID,
      digitalID: userInfo._json.digitalIdentityID,
      appType: 'GMP',
      sagaStatus: 'INITIATED',
      initiateTime: localDateTime.now().toString()
    };
    log.info('going to store event object in redis for complete pen request :: ', event);
    await redisUtil.createProfileRequestSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    log.error('pen request postComment Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'calling saga endpoint for pen request comments raised an error'
    });
  }
}
module.exports = {
  setPenRequestReplicateStatus,
  verifyPenRequestStatus,
  postComment,
  PenRequestStatuses
};
