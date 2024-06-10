import IOREDIS from 'ioredis';
import config from '../../config/index.js';
import log from '../../components/logger.js';

let redisClient;
let connectionClosed = false;

export default {
  /**
   * This method is called during application start and redis client is obtained.
   * The redis client can be reused rather than creating multiple clients.
   */
  init() {
    if ('local' === config.get('environment')){
      redisClient = new IOREDIS({
        host: config.get('redis:host'),
        port: config.get('redis:port')
      });
    } else {
      redisClient = new IOREDIS.Cluster([{
        host: config.get('redis:host'),
        port: config.get('redis:port')
      }]);
    }
    redisClient.on('error', (error) => {
      log.error(`error occurred in redis client. ${error}`);
    });
    redisClient.on('end', (error) => {
      log.error(`redis client end. ${error}`);
      connectionClosed = true;
    });
    redisClient.on('ready', () => {
      log.info('Redis Ready.');
    });
    redisClient.on('connect', () => {
      log.info('connected to redis.');
    });
  },
  isConnectionClosed() {
    return connectionClosed;
  },
  getRedisClient() {
    return redisClient;
  }
};
