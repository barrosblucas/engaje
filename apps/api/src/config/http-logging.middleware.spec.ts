import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';
import { createHttpLoggingMiddleware, resolveRequestId } from './http-logging.middleware';

describe('http-logging.middleware', () => {
  it('preserva x-request-id quando já existe no header', () => {
    expect(resolveRequestId('req-123')).toBe('req-123');
    expect(resolveRequestId(['req-456'])).toBe('req-456');
  });

  it('loga request info com metadados completos em dev', () => {
    const info = jest.fn();
    const warn = jest.fn();
    const error = jest.fn();
    const logger = { info, warn, error } as unknown as Logger;

    let finishHandler: (() => void) | undefined;
    const request = {
      method: 'POST',
      originalUrl: '/v1/auth/login',
      ip: '127.0.0.1',
      headers: {
        'x-request-id': 'req-dev-1',
        origin: 'http://localhost:3000',
        referer: 'http://localhost:3000/login',
        'user-agent': 'jest',
      },
    } as unknown as Request;

    const response = {
      statusCode: 200,
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') finishHandler = handler;
      }),
    } as unknown as Response;

    const next = jest.fn() as NextFunction;
    const middleware = createHttpLoggingMiddleware(logger, { NODE_ENV: 'development' });

    middleware(request, response, next);
    finishHandler?.();

    expect(next).toHaveBeenCalled();
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'req-dev-1');
    expect(info).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-dev-1',
        method: 'POST',
        path: '/v1/auth/login',
        statusCode: 200,
        origin: 'http://localhost:3000',
        referer: 'http://localhost:3000/login',
        userAgent: 'jest',
      }),
      'HTTP request completed',
    );
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('usa nível warn para 4xx e error para 5xx', () => {
    const info = jest.fn();
    const warn = jest.fn();
    const error = jest.fn();
    const logger = { info, warn, error } as unknown as Logger;

    const next = jest.fn() as NextFunction;
    const middleware = createHttpLoggingMiddleware(logger, { NODE_ENV: 'development' });

    let finishHandler404: (() => void) | undefined;
    const request404 = {
      method: 'GET',
      originalUrl: '/v1/invalid',
      ip: '127.0.0.1',
      headers: {},
    } as unknown as Request;
    const response404 = {
      statusCode: 404,
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') finishHandler404 = handler;
      }),
    } as unknown as Response;

    middleware(request404, response404, next);
    finishHandler404?.();

    let finishHandler500: (() => void) | undefined;
    const request500 = {
      method: 'GET',
      originalUrl: '/v1/error',
      ip: '127.0.0.1',
      headers: {},
    } as unknown as Request;
    const response500 = {
      statusCode: 500,
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') finishHandler500 = handler;
      }),
    } as unknown as Response;

    middleware(request500, response500, next);
    finishHandler500?.();

    expect(warn).toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });
});
