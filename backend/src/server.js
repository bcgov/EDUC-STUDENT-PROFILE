import http from 'http';
import { LocalDateTime } from '@js-joda/core';

import config from './config/index.js';
import log from './components/logger.js';
import { close as closeNats } from './messaging/message-subscriber.js';
import './schedulers/student-profile-saga-check-scheduler.js';

Object.defineProperty(log, 'heading', { get: () => { return LocalDateTime.now().toString(); } });

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(config.get('server:port'));
app.set('port', port);

/**
 * Create HTTP server.
 */
// const options = {
//   key: fs.readFileSync('/etc/tls-certs/tls.key'),
//   cert: fs.readFileSync('/etc/tls-certs/tls.crt')
// };

const server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const portNum = parseInt(val, 10);

  if (isNaN(portNum)) {
    // named pipe
    return val;
  }

  if (portNum >= 0) {
    // port number
    return portNum;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    log.error(bind + ' requires elevated privileges');
    //process.exit(1);
    break;
  case 'EADDRINUSE':
    log.error(bind + ' is already in use');
    //process.exit(1);
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
  log.info('Listening on ' + bind);
}

process.on('SIGINT',() => {
  closeNats();
  server.close(() => {
    log.info('process terminated');
  });
});

process.on('SIGTERM', () => {
  closeNats();
  server.close(() => {
    log.info('process terminated');
  });
});

export default {
  normalizePort,
  onError,
  onListening,
  server
};
