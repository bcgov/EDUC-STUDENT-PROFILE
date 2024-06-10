import REDIS from '../util/redis/redis-client.js';
import NATS from '../messaging/message-subscriber.js';
import EXPRESS from 'express';

class HealthCheckController {
  constructor(redis, nats, express) {
    this._redis = redis;
    this._nats = nats;
    this._router = express.Router();
    this._router.get('/api/health', (req, res) => this.healthCheck(req, res));
  }

  get router() {
    return this._router;
  }

  async healthCheck(_req, res) {
    if (this._redis.isConnectionClosed() || this._nats.isConnectionClosed()) {
      res.sendStatus(503);
    } else {
      res.sendStatus(200);
    }
  }
}

export default new HealthCheckController(REDIS, NATS, EXPRESS);
