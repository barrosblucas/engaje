import { type Logger, type LoggerOptions, pino } from 'pino';

type LoggerEnv = {
  LOG_LEVEL?: string;
  NODE_ENV?: string;
} & Record<string, string | undefined>;

const DEFAULT_DEV_LOG_LEVEL = 'debug';
const DEFAULT_PROD_LOG_LEVEL = 'info';

const isProduction = (env: LoggerEnv): boolean => env.NODE_ENV === 'production';

export const resolveLogLevel = (env: LoggerEnv): string => {
  return env.LOG_LEVEL ?? (isProduction(env) ? DEFAULT_PROD_LOG_LEVEL : DEFAULT_DEV_LOG_LEVEL);
};

export const createAppLogger = (env: LoggerEnv): Logger => {
  const options: LoggerOptions = {
    level: resolveLogLevel(env),
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
      remove: true,
    },
  };

  return pino(options);
};
