'use strict';
const log = require('../../components/logger');
const redisUtil = require('../../util/redis/redis-utils');
const SagaTopics = ['PEN_REQUEST_COMMENTS_SAGA_TOPIC','STUDENT_PROFILE_COMMENTS_SAGA_TOPIC'];

function subscribeSagaMessages(stan, opts, topic, handleMessage) {
  const sagaSubscription = stan.subscribe(topic, 'student-profile-pen-req-saga-queue-group', opts);
  sagaSubscription.on('error', (err) => {
    log.error(`subscription for ${topic} raised an error: ${err}`);
  });
  sagaSubscription.on('ready', () => {
    log.info(`subscribed to ${topic}`);
  });
  sagaSubscription.on('message', (msg) => {
    log.silly(`Received message, on ${msg.getSubject()} , Sequence ::  [${msg.getSequence()}] :: Data ::`, JSON.parse(msg.getData()));
    handleMessage(msg);
  });
}

async function handleProfileRequestSagaMessage(msg) {
  const event = JSON.parse(msg.getData()); // it is always a JSON string of Event object.
  if('COMPLETED' === event.sagaStatus || 'FORCE_STOPPED' === event.sagaStatus){
    await redisUtil.removeProfileRequestSagaRecordFromRedis(event);
  }
  msg.ack(); // manual acknowledgement that message was received and processed successfully.
}



const ProfileRequestSagaMessageHandler = {
  /**
   * This is where all the subscription will be done related pen requests
   * due to this issue https://github.com/nats-io/stan.go/issues/208
   * system is needed to have queue group subscription so that message is never lost if all the pod dies,
   * refer to this https://docs.nats.io/nats-streaming-concepts/channels/subscriptions/queue-group
   * create a separate topic for pub sub of messages related to websocket clients.
   * @param stan
   */
  subscribe(stan) {
    const opts = stan.subscriptionOptions().setStartAt(0);
    opts.setManualAckMode(true);
    opts.setAckWait(30000); // 30 seconds
    opts.setDurableName('student-profile-node-consumer');
    SagaTopics.forEach((topic) => {
      subscribeSagaMessages(stan, opts, topic, handleProfileRequestSagaMessage);
    });
  },

};

module.exports = ProfileRequestSagaMessageHandler;
