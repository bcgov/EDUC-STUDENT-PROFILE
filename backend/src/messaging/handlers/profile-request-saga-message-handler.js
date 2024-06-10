import log from '../../components/logger.js';
import { removeProfileRequestSagaRecordFromRedis } from '../../util/redis/redis-utils.js';

const SagaTopics = ['PEN_REQUEST_COMMENTS_SAGA_TOPIC','STUDENT_PROFILE_COMMENTS_SAGA_TOPIC'];

function subscribeSagaMessages(nats, topic, handleMessage) {
  const opts = {
    queue : 'student-profile-pen-req-saga-queue-group'
  };
  nats.subscribe(topic, opts, (msg, reply, subject, sid) => {
    log.info(`Received message, on ${subject} , Subscription Id ::  [${sid}], Reply to ::  [${reply}] :: Data ::`, JSON.parse(msg));
    handleMessage(msg);
  });
}

async function handleProfileRequestSagaMessage(msg) {
  const event = JSON.parse(msg); // it is always a JSON string of Event object.
  if('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus){
    await removeProfileRequestSagaRecordFromRedis(event);
  }
}

export const ProfileRequestSagaMessageHandler = {
  subscribe(nats) {
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(nats, topic, handleProfileRequestSagaMessage);
    });
  },
};
