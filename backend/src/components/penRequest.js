import { LocalDateTime, ChronoUnit } from '@js-joda/core';

import { RequestStatuses, getSessionUser } from './utils.js';
import config from '../config/index.js';

export function setPenRequestReplicateStatus(penRequest) {
  if (penRequest.penRequestStatusCode === PenRequestStatuses.AUTO
    || penRequest.penRequestStatusCode === PenRequestStatuses.MANUAL) {
    let updateTime = LocalDateTime.parse(penRequest.statusUpdateDate);
    let replicateTime = updateTime.truncatedTo(ChronoUnit.HOURS).withHour(config.get('penRequest:replicateTime'));
    if (config.get('penRequest:replicateTime') <= updateTime.hour()) {
      replicateTime = replicateTime.plusDays(1);
    }
    penRequest.tomorrow = penRequest.demogChanged === 'Y' && replicateTime.isAfter(LocalDateTime.now());
  }
  return penRequest;
}

export function verifyPenRequestStatus(req) {
  const userInfo = getSessionUser(req);

  return req.session['penRequest'].penRequestStatusCode !== PenRequestStatuses.REJECTED
    && req.session['penRequest'].penRequestStatusCode !== PenRequestStatuses.ABANDONED
    && !(req.session['penRequest'].penRequestStatusCode === PenRequestStatuses.MANUAL && !userInfo?._json?.studentID);
}

export const PenRequestStatuses = Object.freeze({
  ...RequestStatuses,
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
});

export function createPenRequestCommentPayload(requestID, commentContent) {
  return {
    penRetrievalRequestID: requestID,
    commentContent: commentContent,
    commentTimestamp: LocalDateTime.now().toString().substr(0, 19),
    penRequestStatusCode: RequestStatuses.SUBSREV
  };
}

export function createPenRequestCommentEvent(sagaID, requestID, digitalID) {
  return {
    sagaId: sagaID,
    penRequestID: requestID,
    digitalID: digitalID,
    appType: 'GMP',
    sagaStatus: 'INITIATED',
    initiateTime: LocalDateTime.now().toString()
  };
}
