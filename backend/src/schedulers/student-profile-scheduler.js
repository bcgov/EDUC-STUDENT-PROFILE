'use strict';
const CronJob = require('cron').CronJob;
const config = require('../config/index');
const log = require('../components/logger');
const Redis = require('ioredis');
const {getApiCredentials} = require('../components/auth');
const {getDataWithParams, putData} = require('../components/utils');
const localDateTime = require('@js-joda/core').LocalDateTime;

let redisClient;
if (config.get('environment') !== undefined && config.get('environment') === 'local') {
  redisClient = new Redis({
    host: config.get('redis:host'),
    port: config.get('redis:port'),
    password: config.get('redis:password')
  });
} else {
  redisClient = new Redis.Cluster([
    {
      port: config.get('redis:port'),
      host: config.get('redis:host'),
    }
  ]);
}

const Redlock = require('redlock');
const redLock = new Redlock(
  [redisClient],
  {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 5,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200 // time in ms
  }
);
redLock.on('clientError', function (err) {
  log.error('A redis connection error has occurred:', err);
});

const schedulerCronPenrequestDraft = config.get('scheduler:schedulerCronProfileRequestDraft');
const numDaysAllowedInDraftStatus = config.get('scheduler:numDaysAllowedInDraftStatus');
const expectedDraftRequests = config.get('scheduler:expectedDraftRequest');
const dateTime = localDateTime.now().minusDays(numDaysAllowedInDraftStatus);
const draftToAbandonRequestJob = new CronJob(schedulerCronPenrequestDraft, () => {

  redLock.lock('locks:student-profile-request:draft-abandoned', 60000).then(async function (lock) {
    return await findAndUpdateDraftProfileRequestsToAbandoned(lock);
  }).catch((err) => {
    log.info(`this pod could not acquire lock, check other pods. ${err}`);
  });

});

async function findAndUpdateDraftProfileRequestsToAbandoned(lock) {
  try {
    await new Promise(resolve => setTimeout(resolve, 5000)); // set a time out of 5 seconds to start the process after that, as we dont want to release the lock before 5 seconds, so that other pods will acquire it.
    log.info(`starting job for moving pen requests in draft status for more than ${numDaysAllowedInDraftStatus} days to abandon status based on cron ${schedulerCronPenrequestDraft}, ${process.pid}`);
    const data = await getApiCredentials();
    const accessToken = data.accessToken;
    let searchListCriteria = [];
    searchListCriteria.push({key: 'studentRequestStatusCode', operation: 'eq', value: 'DRAFT', valueType: 'STRING'});
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
    const result = await getDataWithParams(accessToken, config.get('studentProfile:apiEndpoint') + '/paginated', params);
    log.silly(JSON.stringify(result));
    if (result['content'] && result['content'].length > 0) {
      const updatePenReqResult = [];
      for (const profileReqIndex in result['content']) {
        const profileReq = result['content'][profileReqIndex];
        profileReq.statusUpdateDate = localDateTime.now().toString();
        profileReq.studentRequestStatusCode = 'ABANDONED';
        const putDataResult = putData(accessToken, profileReq, config.get('studentProfile:apiEndpoint'));
        updatePenReqResult.push(putDataResult);

      }
      await Promise.allSettled(updatePenReqResult);
    }

    // unlock your resource when you are done
    return lock.unlock()
      .catch(function (err) {
        // we weren't able to reach redis; your lock will eventually
        // expire, but you probably want to log this error
        log.info(`Error while trying to release lock ${err}`);
      });
  } catch (e) {
    log.error(`Error occurred while executing findAndUpdateDraftPenRequestsToAbandoned ${e}`);
  }

}
const scheduler = {
  draftToAbandonRequestJob: draftToAbandonRequestJob
};
module.exports = scheduler;

