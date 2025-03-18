import { isConnectionClosed as redisConnectionIsClosed } from '../util/redis/redis-client.js';
import { isConnectionClosed as natsConnectionIsClosed } from '../messaging/message-subscriber.js';
import EXPRESS from 'express';

class HealthCheckController {
  constructor(express) {
    this._router = express.Router();
    this._router.get('/api/health', (req, res) => this.healthCheck(req, res));
  }

  get router() {
    return this._router;
  }

  async healthCheck(_req, res) {
    if (redisConnectionIsClosed() || natsConnectionIsClosed()) {
      res.sendStatus(503);
    } else {
      res.sendStatus(200);
    }
  }
}

export default new HealthCheckController(EXPRESS);
