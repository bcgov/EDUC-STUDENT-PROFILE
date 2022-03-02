'use strict';

const { RequestStatuses } = require('./utils');
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

function verifyStudentRequestStatus(req) {
  return req.session['studentRequest'].studentRequestStatusCode !== StudentRequestStatuses.REJECTED && 
    req.session['studentRequest'].studentRequestStatusCode !== StudentRequestStatuses.ABANDONED && 
    req.session['studentRequest'].studentRequestStatusCode !== StudentRequestStatuses.COMPLETED;
}

const StudentRequestStatuses = Object.freeze({
  ...RequestStatuses,
  COMPLETED: 'COMPLETED'
});

function createStudentRequestCommentPayload(requestID, commentContent) {
  return {
    studentProfileRequestID: requestID,
    commentContent: commentContent,
    commentTimestamp: localDateTime.now().toString().substr(0, 19),
    studentProfileRequestStatusCode: RequestStatuses.SUBSREV
  };
}

function createStudentRequestCommentEvent(sagaID, requestID, digitalID) {
  return {
    sagaId: sagaID,
    studentProfileRequestID: requestID,
    digitalID: digitalID,
    appType: 'UMP',
    sagaStatus: 'INITIATED',
    initiateTime: localDateTime.now().toString()
  };
}

module.exports = {
  setStudentRequestReplicateStatus,
  verifyStudentRequestStatus,
  createStudentRequestCommentPayload,
  createStudentRequestCommentEvent,
  StudentRequestStatuses
};
