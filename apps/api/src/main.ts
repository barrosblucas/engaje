import 'reflect-metadata';
import * as path from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { pino } from 'pino';
import { AppModule } from './app.module';
import { createCorsOriginValidator, getAllowedAppOrigins } from './config/app-origins';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: {
      log: (msg: string) => logger.info(msg),
      error: (msg: string) => logger.error(msg),
      warn: (msg: string) => logger.warn(msg),
      debug: (msg: string) => logger.debug(msg),
      verbose: (msg: string) => logger.trace(msg),
    },
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
  logger.info(`API running on http://localhost:${port}/v1`);
  logger.info(`Allowed app origins: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch((err: unknown) => {
  logger.error(err);
  process.exit(1);
});
