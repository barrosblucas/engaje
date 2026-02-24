import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testEmailPattern = 'test-auth';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true, sameSite: 'lax' },
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    await app.init();

    prisma = moduleRef.get(PrismaService);

    await prisma.registration.deleteMany({
      where: { user: { email: { contains: testEmailPattern } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: testEmailPattern } } });
  });

  afterAll(async () => {
    await prisma.registration.deleteMany({
      where: { user: { email: { contains: testEmailPattern } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: testEmailPattern } } });
    await app.close();
  });

  describe('POST /v1/auth/register', () => {
    const validPayload = {
      name: 'Test User',
      cpf: '52998224725',
      email: 'test-auth-register@example.com',
      phone: '11999999999',
      password: 'senha123',
    };

    it('registra cidadão com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send(validPayload)
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(validPayload.email);
      expect(res.body.user.role).toBe('citizen');
    });

    it('retorna 409 para CPF duplicado', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ ...validPayload, email: 'test-auth-cpf-dup@example.com' })
        .expect(409);
    });

    it('retorna 409 para e-mail duplicado', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ ...validPayload, cpf: '11144477735', email: validPayload.email })
        .expect(409);
    });

    it('retorna erro para CPF inválido', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/register')
        .send({ ...validPayload, cpf: '00000000000', email: 'test-auth-cpfinvalid@example.com' })
        .expect(409);
    });
  });

  describe('POST /v1/auth/login', () => {
    const user = {
      name: 'Login Test',
      cpf: '11144477735',
      email: 'test-auth-login@example.com',
      phone: '11999999999',
      password: 'senha123',
    };

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/v1/auth/register').send(user);
    });

    it('faz login com e-mail', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ identifier: user.email, password: user.password })
        .expect(200);
      expect(res.body.user.email).toBe(user.email);
    });

    it('faz login com CPF', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ identifier: user.cpf, password: user.password })
        .expect(200);
      expect(res.body.user).toBeDefined();
    });

    it('cria sessão após login e permite consultar /auth/me', async () => {
      const agent = request.agent(app.getHttpServer());

      const loginResponse = await agent
        .post('/v1/auth/login')
        .send({ identifier: user.email, password: user.password })
        .expect(200);

      const setCookieHeader = loginResponse.headers['set-cookie'];
      const cookieHeaderValue = Array.isArray(setCookieHeader)
        ? setCookieHeader.join(';')
        : (setCookieHeader ?? '');
      expect(cookieHeaderValue).toContain('connect.sid=');

      const meResponse = await agent.get('/v1/auth/me').expect(200);
      expect(meResponse.body.user.email).toBe(user.email);
    });

    it('retorna 401 para senha errada', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ identifier: user.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('POST /v1/auth/logout', () => {
    it('encerra sessão', async () => {
      await request(app.getHttpServer()).post('/v1/auth/logout').expect(204);
    });
  });
});
