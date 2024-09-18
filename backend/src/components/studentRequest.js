import { RequestStatuses } from './utils.js';
import config from '../config/index.js';
import { LocalDateTime, ChronoUnit } from '@js-joda/core';

export function setStudentRequestReplicateStatus(request) {
  if (request.studentRequestStatusCode === StudentRequestStatuses.COMPLETED) {
    const updateTime = LocalDateTime.parse(request.statusUpdateDate);
    let replicateTime = updateTime.truncatedTo(ChronoUnit.HOURS).withHour(config.get('studentRequest:replicateTime'));
    if (config.get('studentRequest:replicateTime') <= updateTime.hour()) {
      replicateTime = replicateTime.plusDays(1);
    }
    request.tomorrow = replicateTime.isAfter(LocalDateTime.now());
  }
  return request;
}

export function verifyStudentRequestStatus(req) {
  return req.session['studentRequest'].studentRequestStatusCode !== StudentRequestStatuses.REJECTED && 
    req.session['studentRequest'].studentRequestStatusCode !== StudentRequestStatuses.ABANDONED && 
    req.session['studentRequest'].studentRequestStatusCode !== StudentRequestStatuses.COMPLETED;
}

export const StudentRequestStatuses = Object.freeze({
  ...RequestStatuses,
  COMPLETED: 'COMPLETED'
});

export function createStudentRequestCommentPayload(requestID, commentContent) {
  return {
    studentProfileRequestID: requestID,
    commentContent: commentContent,
    commentTimestamp: LocalDateTime.now().toString().substr(0, 19),
    studentProfileRequestStatusCode: RequestStatuses.SUBSREV
  };
}

export function createStudentRequestCommentEvent(sagaID, requestID, digitalID) {
  return {
    sagaId: sagaID,
    studentProfileRequestID: requestID,
    digitalID: digitalID,
    appType: 'UMP',
    sagaStatus: 'INITIATED',
    initiateTime: LocalDateTime.now().toString()
  };
}
