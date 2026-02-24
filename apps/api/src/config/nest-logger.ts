import type { LoggerService } from '@nestjs/common';
import type { Logger } from 'pino';

const normalizeLogMessage = (message: unknown): string => {
  if (typeof message === 'string') return message;

  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
};

const createLogMeta = (context?: string, trace?: string): { context?: string; trace?: string } => {
  return {
    context,
    trace,
  };
};

export const createNestLogger = (logger: Logger): LoggerService => ({
  log: (message: unknown, context?: string) => {
    logger.info(createLogMeta(context), normalizeLogMessage(message));
  },
  error: (message: unknown, trace?: string, context?: string) => {
    logger.error(createLogMeta(context, trace), normalizeLogMessage(message));
  },
  warn: (message: unknown, context?: string) => {
    logger.warn(createLogMeta(context), normalizeLogMessage(message));
  },
  debug: (message: unknown, context?: string) => {
    logger.debug(createLogMeta(context), normalizeLogMessage(message));
  },
  verbose: (message: unknown, context?: string) => {
    logger.trace(createLogMeta(context), normalizeLogMessage(message));
  },
});
