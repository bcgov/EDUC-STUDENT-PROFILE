'use strict';

import { createLogger, format, transports } from 'winston';
import { inspect } from 'util';
import lodash from 'lodash';
import hasAnsi from 'has-ansi';
import stripAnsi from 'strip-ansi';
import safeStringify from 'fast-safe-stringify';

import config from '../config/index.js';

import 'winston-daily-rotate-file';

const { omit, pickBy } = lodash;

function isPrimitive(val) {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

function formatWithInspect(val, colors = true) {
  if (val instanceof Error) {
    return '';
  }

  const shouldFormat = typeof val !== 'string' && !hasAnsi(val);
  const formattedVal = shouldFormat ? inspect(val, { depth: null, colors }) : (colors ? val : stripAnsi(val));

  return isPrimitive(val) ? formattedVal : `\n${formattedVal}`;
}

/**
 * Handles all the different log formats
 * https://github.com/winstonjs/winston/issues/1427#issuecomment-535297716
 * https://github.com/winstonjs/winston/issues/1427#issuecomment-583199496
 * @param {*} colors
 */
function getDomainWinstonLoggerFormat(colors = true) {
  const colorize = colors ? format.colorize() : null;
  const loggingFormats = [
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    format.errors({ stack: true }),
    colorize,
    format.printf((info) => {
      const stackTrace = info.stack ? `\n${info.stack}` : '';

      // handle single object
      if (!info.message) {
        const obj = omit(info, ['level', 'timestamp', Symbol.for('level')]);
        return `${info.timestamp} - ${info.level}: ${formatWithInspect(obj, colors)}${stackTrace}`;
      }

      const splatArgs = info[Symbol.for('splat')] || [];
      const rest = splatArgs.map(data => formatWithInspect(data, colors)).join(' ');
      const msg = formatWithInspect(info.message, colors);

      return `${info.timestamp} - ${info.level}: ${msg} ${rest}${stackTrace}`;
    }),
  ].filter(Boolean);
  return format.combine(...loggingFormats);
}

/**
 * Handles JSON formats
 */
function getDomainWinstonLoggerJsonFormat() {
  const loggingFormats = [
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    format.errors({ stack: true }),
    format.printf((info) => {
      const stackTrace = info.stack || '';

      let message;
      // handle single object
      if (!info.message) {
        const obj = omit(info, ['level', 'timestamp', Symbol.for('level')]);
        message = obj;
      } else {
        message = stripAnsi(info.message);
      }

      const splatArgs = info[Symbol.for('splat')] || [];
      const detail = splatArgs.map(data => typeof data === 'string' ? stripAnsi(data) : data);

      return safeStringify(pickBy({
        timestamp: info.timestamp,
        level: info.level,
        message,
        detail: detail.length > 0 ? detail : null,
        stackTrace
      }));
    }),
  ];
  return format.combine(...loggingFormats);
}

const logger = createLogger({
  level: config.get('server:logLevel'),
  format: getDomainWinstonLoggerJsonFormat(),
  transports: [
    new transports.DailyRotateFile({
      filename: 'app-%DATE%.log',
      dirname: './logs',
      datePattern: 'YYYY-MM-DD',
      maxSize: '5m',
      maxFiles: 1,
      zippedArchive: true,
    })
  ]
});

logger.add(new transports.Console({
  format: getDomainWinstonLoggerFormat(true)
}));

export default logger;
