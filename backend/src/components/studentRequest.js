'use strict';

const { RequestStatuses, getAccessToken, postData, getSessionUser } = require('./utils');
const HttpStatus = require('http-status-codes');
const redisUtil = require('../util/redis/redis-utils');
const log = require('./logger');
const config = require('../config/index');
const localDateTime = require('@js-joda/core').LocalDateTime;
const ChronoUnit = require('@js-joda/core').ChronoUnit;

function setStudentRequestReplicateStatus(request) {
  if (request.studentRequestStatusCode === StudentRequestStatuses.COMPLETED) {
    const updateTime = localDateTime.parse(request.statusUpdateDate);
    let replicateTime = updateTime.truncatedTo(ChronoUnit.HOURS).withHour(config.get('studentRequest:replicateTime'));
    if (config.get('studentRequest:replicateTime') <= updateTime.hour()) {
      replicateTime = replicateTime.plusDays(1);
    }
    request.tomorrow = replicateTime.isAfter(localDateTime.now());
  }
  return request;
}

function verifyStudentRequestStatus(request) {
  return request.studentRequestStatusCode !== StudentRequestStatuses.REJECTED && 
    request.studentRequestStatusCode !== StudentRequestStatuses.ABANDONED && 
    request.studentRequestStatusCode !== StudentRequestStatuses.COMPLETED;
}

const StudentRequestStatuses = Object.freeze({
  ...RequestStatuses,
  COMPLETED: 'COMPLETED'
});

async function postComment(req, res) {
  try {
    const requestType = 'studentRequest';
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

    const url = `${config.get('profileSagaAPIURL')}/student-profile-comment-saga`;
    const studentProfileRequestID = req.params.id;
    const payload = {
      studentProfileRequestID: studentProfileRequestID,
      commentContent: req.body.content,
      commentTimestamp: localDateTime.now().toString().substr(0, 19),
      studentProfileRequestStatusCode: RequestStatuses.SUBSREV
    };
    const sagaId = await postData(accessToken, payload, url);
    const event = {
      sagaId: sagaId,
      studentProfileRequestStatusCode: studentProfileRequestID,
      digitalID: userInfo._json.digitalIdentityID,
      appType: 'UMP',
      sagaStatus: 'INITIATED',
      initiateTime: localDateTime.now().toString()
    };
    log.info('going to store event object in redis for complete student profile request :: ', event);
    await redisUtil.createProfileRequestSagaRecordInRedis(event);
    return res.status(200).json();
  } catch (e) {
    log.error('student profile request postComment Error', e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'calling saga endpoint for student profile request comments raised an error'
    });
  }
}
module.exports = {
  setStudentRequestReplicateStatus,
  verifyStudentRequestStatus,
  postComment,
  StudentRequestStatuses
};
