'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const {getApiCredentials} = require('../components/auth');
const {getDataWithParams, putData} = require('../components/utils');
const localDateTime = require('@js-joda/core').LocalDateTime;
const redisUtil = require('../util/redis/redis-utils');
const schedulerCronPenRequestDraft = config.get('scheduler:schedulerCronProfileRequestDraft');
const numDaysAllowedInDraftStatus = config.get('scheduler:numDaysAllowedInDraftStatus');
const expectedDraftRequests = config.get('scheduler:expectedDraftRequest');
const dateTime = localDateTime.now().minusDays(numDaysAllowedInDraftStatus);

const draftToAbandonRequestJob = new CronJob(schedulerCronPenRequestDraft, async () => {
  const redLock = redisUtil.getRedLock();
  try {
    await redLock.lock('locks:student-profile-request:draft-abandoned', 6000); // no need to release the lock as it will auto expire after 6000 ms.
    await Promise.all([
      findAndUpdateDraftProfileRequestsToAbandoned('penRequest'),
      findAndUpdateDraftProfileRequestsToAbandoned('studentRequest'),
    ]);
  } catch (e) {
    log.info(`locks:student-profile-request:draft-abandoned, check other pods. ${e}`);
  }
});

async function findAndUpdateDraftProfileRequestsToAbandoned(requestType) {
  try {
    log.info(`starting job for moving ${requestType}s in draft status for more than ${numDaysAllowedInDraftStatus} days to abandon status based on cron ${schedulerCronPenRequestDraft}, ${process.pid}`);
    const data = await getApiCredentials(config.get('oidc:clientId'), config.get('oidc:clientSecret'));
    const accessToken = data.accessToken;
    let searchListCriteria = [];
    searchListCriteria.push({key: `${requestType}StatusCode`, operation: 'eq', value: 'DRAFT', valueType: 'STRING'});
    searchListCriteria.push({
      key: 'statusUpdateDate',
      operation: 'lt',
      value: dateTime.toString(),
      valueType: 'DATE_TIME'
    });

    const params = {
      params: {
        pageSize: expectedDraftRequests, // maximum value assumed, may not be the ideal value.
        searchCriteriaList: JSON.stringify(searchListCriteria)
      }
    };
    const result = await getDataWithParams(accessToken, config.get(`${requestType}:apiEndpoint`) + '/paginated', params);
    log.silly(JSON.stringify(result));
    if (result['content'] && result['content'].length > 0) {
      const updateReqResult = [];
      for (const profileReqIndex in result['content']) {
        const profileReq = result['content'][profileReqIndex];
        profileReq.statusUpdateDate = localDateTime.now().toString();
        profileReq[`${requestType}StatusCode`] = 'ABANDONED';
        const putDataResult = putData(accessToken, profileReq, config.get(`${requestType}:apiEndpoint`));
        updateReqResult.push(putDataResult);

      }
      await Promise.allSettled(updateReqResult);
    }
  } catch (e) {
    log.error(`Error occurred while executing findAndUpdateDraftProfileRequestsToAbandoned ${e}`);
  }

}
const scheduler = {
  draftToAbandonRequestJob: draftToAbandonRequestJob
};
module.exports = scheduler;

