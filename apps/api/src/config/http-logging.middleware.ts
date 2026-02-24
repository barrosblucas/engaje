import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

type HttpLoggingEnv = {
  NODE_ENV?: string;
} & Record<string, string | undefined>;

const resolveHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  if (Array.isArray(value) && value.length > 0) {
    const firstValue = value[0]?.trim();
    return firstValue && firstValue.length > 0 ? firstValue : undefined;
  }

  return undefined;
};

export const resolveRequestId = (headerValue: string | string[] | undefined): string => {
  return resolveHeaderValue(headerValue) ?? randomUUID();
};

export const createHttpLoggingMiddleware = (logger: Logger, env: HttpLoggingEnv) => {
  const includeDevMetadata = env.NODE_ENV !== 'production';

  return (request: Request, response: Response, next: NextFunction) => {
    const startedAt = process.hrtime.bigint();
    const requestId = resolveRequestId(request.headers['x-request-id']);

    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      const elapsed = process.hrtime.bigint() - startedAt;
      const durationMs = Number(elapsed) / 1_000_000;

      const basePayload = {
        requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        ip: request.ip,
      };

      const logPayload = includeDevMetadata
        ? {
            ...basePayload,
            origin: resolveHeaderValue(request.headers.origin),
            referer: resolveHeaderValue(request.headers.referer),
            userAgent: resolveHeaderValue(request.headers['user-agent']),
          }
        : basePayload;

      if (response.statusCode >= 500) {
        logger.error(logPayload, 'HTTP request completed');
        return;
      }

      if (response.statusCode >= 400) {
        logger.warn(logPayload, 'HTTP request completed');
        return;
      }

      logger.info(logPayload, 'HTTP request completed');
    });

    next();
  };
};
