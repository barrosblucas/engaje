import 'reflect-metadata';
import * as path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { createAppLogger, resolveLogLevel } from './config/app-logger';
import { createCorsOriginValidator, getAllowedAppOrigins } from './config/app-origins';
import { createHttpLoggingMiddleware } from './config/http-logging.middleware';
import { createNestLogger } from './config/nest-logger';

const logger = createAppLogger(process.env);
const nodeEnv = process.env.NODE_ENV ?? 'development';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: createNestLogger(logger),
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.use(createHttpLoggingMiddleware(logger, process.env));

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useStaticAssets(path.join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const allowedOrigins = getAllowedAppOrigins(process.env);
  app.enableCors({
    origin: createCorsOriginValidator(process.env),
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.info(
    {
      port,
      env: nodeEnv,
      logLevel: resolveLogLevel(process.env),
      allowedOrigins,
    },
    'API running',
  );
}

bootstrap().catch((err: unknown) => {
  logger.error(err);
  process.exit(1);
});
