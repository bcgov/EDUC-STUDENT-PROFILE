import config from '../config/index.js';
import log from '../components/logger.js';
import { ProfileRequestSagaMessageHandler } from './handlers/profile-request-saga-message-handler.js';
import nats from 'nats';

let connection={};
let connectionClosed = false;

const server = config.get('messaging:natsUrl');
console.log('server:', server);
const natsOptions = {
  servers: [server],
  maxReconnectAttempts: 60,
  name: 'STUDENT-PROFILE-NODE',
  reconnectTimeWait: 5000,
  waitOnFirstConnect: true,
  pingInterval: 5000
};

export const NATS = {
  async init() {
    try {
      connection = await nats.connect(natsOptions);
    } catch (e) {
      log.error(`error ${e}`);
    }
  },
  eventCallbacks() {
    connection.on('connect', function () {
      log.info('NATS connected!', connection?.currentServer?.url?.host);
      ProfileRequestSagaMessageHandler.subscribe(connection);
    });

    connection.on('error', function (reason) {
      log.error(`error on NATS ${reason}`);
    });
    connection.on('connection_lost', (error) => {
      log.error('disconnected from NATS', error);
    });
    connection.on('close', (error) => {
      log.error('NATS closed', error);
      connectionClosed = true;
    });
    connection.on('reconnecting', () => {
      log.error('NATS reconnecting');
    });
    connection.on('reconnect', () => {
      log.info('NATS reconnected');
    });
  },
  close(){
    if (connection){
      connection.close();
    }
  },
  isConnectionClosed() {
    return connectionClosed;
  },

};

export default NATS;
