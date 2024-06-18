import log from '../../components/logger.js';
import { removeProfileRequestSagaRecordFromRedis } from '../../util/redis/redis-utils.js';

/** @typedef {['PEN_REQUEST_COMMENTS_SAGA_TOPIC','STUDENT_PROFILE_COMMENTS_SAGA_TOPIC']} SagaTopics */
const SagaTopics = ['PEN_REQUEST_COMMENTS_SAGA_TOPIC','STUDENT_PROFILE_COMMENTS_SAGA_TOPIC'];

/**
 * @param {import('nats').NatsConnection} nats
 * @param {SagaTopics} topic
 */
function subscribeSagaMessages(nats, topic, handleMessage) {
  /** @type {import('nats').SubscriptionOptions} */
  const opts = {
    queue: 'student-profile-pen-req-saga-queue-group',
    callback: (error, msg) => {
      if (error !== null) throw new Error(error);

      const { subject, sid, reply } = msg;
      log.info(
        `Received message, on ${subject}, Subscription Id :: [${sid}], Reply to :: [${reply}] :: Data ::`,
        JSON.parse(msg)
      );

      handleMessage(msg);
    }
  };
  nats.subscribe(topic, opts);
}

/** @param {import('nats').Msg} msg */
async function handleProfileRequestSagaMessage(msg) {
  const event = msg.json();
  if ('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus) {
    await removeProfileRequestSagaRecordFromRedis(event);
  }
}

export const ProfileRequestSagaMessageHandler = {
  subscribe(nats) {
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(nats, topic, handleProfileRequestSagaMessage);
      log.info(`NATS: Subscribed to ${topic}`);
    });
  },
};
