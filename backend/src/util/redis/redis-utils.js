import safeStringify from 'fast-safe-stringify';
import RedLock from 'redlock';
import {LocalDateTime} from '@js-joda/core';

import { getRedisClient } from './redis-client.js';
import log from '../../components/logger.js';

const profileRequestSagaEventKey = 'PROFILE_REQUEST_SAGA_EVENTS';
let redLock;

/**
 * @param event the event object to be stored , this contains sagaId, penRequestId,digitalId, eventPayload etc..
 * @returns {Promise<void>}
 */
export async function createProfileRequestSagaRecordInRedis(event) {
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      if (event) {
        event.createDateTime = LocalDateTime.now().toString(); // store the timestamp so that it can be checked through scheduler.
      }
      await this.addElementToSagaRecordInRedis(event.sagaId, event);
    } else {
      log.error('Redis client is not available, this should not have happened');
    }
  } catch (e) {
    log.error(`Error ${e}`);
  }
}

export async function removeProfileRequestSagaRecordFromRedis(event) {
  let recordFoundFromRedis = false;
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      const result = await redisClient.smembers(profileRequestSagaEventKey);
      if (result && result.length > 0) {
        for (const element of result) {
          const eventArrayElement = JSON.parse(element);
          if ((eventArrayElement.sagaId && event.sagaId && eventArrayElement.sagaId === event.sagaId) && ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus)) {
            log.info(`going to delete this event record as it is completed or force stopped. SAGA ID :: ${eventArrayElement.sagaId} AND STATUS :: ${event.sagaStatus}`);
            recordFoundFromRedis = true;
            await this.removeSagaRecordFromRedis(event.sagaId, eventArrayElement);
            log.info(`Event record deleted from REDIS. SAGA ID :: ${eventArrayElement.sagaId} AND STATUS :: ${event.sagaStatus}`);
            break;
          }
        }
      }
    } catch (e) {
      log.error(`Error ${e}`);
    }
  } else {
    log.error('Redis client is not available, this should not have happened');
  }
  return recordFoundFromRedis;
}

export async function getProfileRequestSagaEvents() {
  const redisClient = getRedisClient();
  if (redisClient) {
    return redisClient.smembers(profileRequestSagaEventKey);
  } else {
    log.error('Redis client is not available, this should not have happened');
  }
}

/**
 * @param digitalID it is mandatory
 */
export async function isSagaInProgressForDigitalID(digitalID) {
  let sagaInProgress = false;
  if(digitalID){
    const eventsArrayFromRedis = await this.getProfileRequestSagaEvents();
    for (const eventString of eventsArrayFromRedis) {
      const event = JSON.parse(eventString);
      if (event && event.digitalID && event.digitalID === digitalID) {
        sagaInProgress = true; // show generic message in frontend.
        break;
      }
    }
    return sagaInProgress;
  }else {
    throw Error('digitalID is required');
  }

}

export async function removeSagaRecordFromRedis(sagaId, eventToDelete) {
  const redisClient = getRedisClient();
  try {
    await this.getRedLock().lock(`locks:profile-request-saga:deleteFromSet-${sagaId}`, 600);
    await redisClient.srem(profileRequestSagaEventKey, safeStringify(eventToDelete));
  } catch (e) {
    log.info(`this pod could not acquire lock for locks:profile-request-saga:deleteFromSet-${sagaId}, check other pods. ${e}`);
  }
}

export async function addElementToSagaRecordInRedis(sagaId, eventToAdd) {
  const redisClient = getRedisClient();
  try {
    await this.getRedLock().lock(`locks:profile-request-saga:addToSet-${sagaId}`, 600);
    await redisClient.sadd(profileRequestSagaEventKey, safeStringify(eventToAdd));
  } catch (e) {
    log.info(`this pod could not acquire lock for locks:profile-request-saga:addToSet-${sagaId}, check other pods. ${e}`);
  }
}

export function getRedLock() {
  if (redLock) {
    return redLock; // reusable red lock object.
  } else {
    redLock = new RedLock(
      [getRedisClient()],
      {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 6,

        // the time in ms between attempts
        retryDelay: 50, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 25 // time in ms
      }
    );
  }
  redLock.on('clientError', function (err) {
    log.error('A redis connection error has occurred in getRedLock of redis-util:', err);
  });
  return redLock;
}
