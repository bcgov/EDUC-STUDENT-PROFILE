import { describe, it, expect, afterAll, vi } from 'vitest';
import redis from 'redis-mock';
import express from 'express';

import * as server from '../../../src/server.js';

vi.mock('ioredis', () => {
  return {
    detault: redis
  };
});

vi.mock('../../../src/app.js', () => {
  return {
    default: express()
  };
});

afterAll(() => {
  server.server.close();
});

describe('normalizePort', () => {
  it('should return input value if valid number', () => {
    const response = server.normalizePort(443);
    expect(response).toBe(443);
  });
  it('should return named pipe if non-number input', () => {
    const response = server.normalizePort('portName');
    expect(response).toBe('portName');
  });
  it('should return false if port is less than 0', () => {
    const response = server.normalizePort(-5);
    expect(response).toBe(false);
  });
});

describe('onError', () => {
  it('should throw generic error', () => {
    expect(() => {server.onError({error: {
      syscall: 'notError'
    }});}).toThrow(Object);
  });
  it('should not throw error on EACCESS code', () => {
    const errorMess = {error: {}};
    errorMess.code = 'EACCES';
    errorMess.syscall = 'listen';
    server.onError(errorMess);
  });
  it('should not throw error on EADDRINUSE code', () => {
    const errorMess = {error: {}};
    errorMess.code = 'EADDRINUSE';
    errorMess.syscall = 'listen';
    server.onError(errorMess);
  });
  it('should throw error if code is unknown', () => {
    const errorMess = {error: {}};
    errorMess.code = 'randomCode';
    errorMess.syscall = 'listen';
    expect(() => {server.onError(errorMess);}).toThrow(Object);
  });
});

/*describe('onListening', () => {
  it('should execute without errors', () => {
    server.onListening();
  });
});
*/
