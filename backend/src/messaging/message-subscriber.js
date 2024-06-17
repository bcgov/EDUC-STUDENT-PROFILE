import config from '../config/index.js';
import log from '../components/logger.js';
import { ProfileRequestSagaMessageHandler } from './handlers/profile-request-saga-message-handler.js';
import nats from 'nats';

/**
 * Shared NATS connection object
 * @type {nats.NatsConnection}
 */
let connection={};
let connectionClosed = false;

const server = config.get('messaging:natsUrl');

/** @type {nats.ConnectionOptions} */
const natsOptions = {
  servers: [server],
  maxReconnectAttempts: 60,
  name: 'STUDENT-PROFILE-NODE',
  reconnectTimeWait: 5000,
  waitOnFirstConnect: true,
  pingInterval: 5000
};

async function listenForEvents() {
  log.info(`Connected to NATS: ${connection.getServer()}`);

  ProfileRequestSagaMessageHandler.subscribe(connection);
  for await (const status of connection.status()) {
    if (status.type != 'pingTimer') {
      log.info(`NATS ${status.type}: ${JSON.stringify(status.data)}`);
    }
  }
}

export function close() {
  if (connection){
    connection.close();
  }
}

export function isConnectionClosed() {
  return connectionClosed;
}

export async function init() {
  try {
    connection = await nats.connect(natsOptions);
    listenForEvents();
    connection.closed().then(err => log.error(`connection closed ${err ? "with error: " + err.message : ""}`));
  } catch (e) {
    log.error(`error ${e}`);
  }
}
