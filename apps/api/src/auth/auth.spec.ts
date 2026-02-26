import { createHash } from 'node:crypto';
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
    await prisma.passwordResetToken.deleteMany({
      where: { user: { email: { contains: testEmailPattern } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: testEmailPattern } } });
  });

  afterAll(async () => {
    await prisma.registration.deleteMany({
      where: { user: { email: { contains: testEmailPattern } } },
    });
    await prisma.passwordResetToken.deleteMany({
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

  describe('PATCH /v1/auth/profile', () => {
    const user = {
      name: 'Profile Test User',
      cpf: '15350946056',
      email: 'test-auth-profile@example.com',
      phone: '67999998888',
      password: 'senha123',
    };

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/v1/auth/register').send(user);
    });

    it('atualiza nome, email e telefone mantendo cpf', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent.post('/v1/auth/login').send({ identifier: user.email, password: user.password });

      const response = await agent
        .patch('/v1/auth/profile')
        .send({
          name: 'Profile Updated',
          email: 'test-auth-profile-updated@example.com',
          phone: '67988887777',
        })
        .expect(200);

      expect(response.body.user.name).toBe('Profile Updated');
      expect(response.body.user.email).toBe('test-auth-profile-updated@example.com');
      expect(response.body.user.phone).toBe('67988887777');
      expect(response.body.user.cpf).toBe(user.cpf);
    });
  });

  describe('PATCH /v1/auth/password', () => {
    const user = {
      name: 'Password Test User',
      cpf: '39053344705',
      email: 'test-auth-password@example.com',
      phone: '67977776666',
      password: 'senha123',
    };

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/v1/auth/register').send(user);
    });

    it('altera senha quando senha atual está correta', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent.post('/v1/auth/login').send({ identifier: user.email, password: user.password });

      await agent
        .patch('/v1/auth/password')
        .send({
          currentPassword: user.password,
          newPassword: 'novaSenha123',
        })
        .expect(204);

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ identifier: user.email, password: user.password })
        .expect(401);

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ identifier: user.email, password: 'novaSenha123' })
        .expect(200);
    });

    it('retorna 401 com senha atual inválida', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent.post('/v1/auth/login').send({ identifier: user.email, password: 'novaSenha123' });

      await agent
        .patch('/v1/auth/password')
        .send({
          currentPassword: 'errada',
          newPassword: 'novaSenha456',
        })
        .expect(401);
    });
  });

  describe('POST /v1/auth/password/forgot and /v1/auth/password/reset', () => {
    const user = {
      name: 'Reset Test User',
      cpf: '86288366757',
      email: 'test-auth-reset@example.com',
      phone: '67966665555',
      password: 'senha123',
    };

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/v1/auth/register').send(user);
    });

    it('retorna resposta genérica para solicitação de reset', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/password/forgot')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.expiresInHours).toBe(2);
      expect(response.body.message).toContain('expira em 2 horas');
    });

    it('rejeita token expirado', async () => {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });
      if (!dbUser) {
        throw new Error('Usuário de teste não encontrado para token expirado');
      }

      const rawToken = 'token-expirado-auth-test';
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId: dbUser.id,
          tokenHash,
          expiresAt: new Date(Date.now() - 5 * 60_000),
        },
      });

      await request(app.getHttpServer())
        .post('/v1/auth/password/reset')
        .send({ token: rawToken, newPassword: 'novaSenha789' })
        .expect(400);
    });

    it('redefine senha com token válido e marca token como usado', async () => {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });
      if (!dbUser) {
        throw new Error('Usuário de teste não encontrado para token válido');
      }

      const rawToken = 'token-valido-auth-test';
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId: dbUser.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 2 * 60 * 60_000),
        },
      });

      await request(app.getHttpServer())
        .post('/v1/auth/password/reset')
        .send({ token: rawToken, newPassword: 'senhaReset123' })
        .expect(204);

      const consumedToken = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { usedAt: true },
      });
      expect(consumedToken?.usedAt).not.toBeNull();

      await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({ identifier: user.email, password: 'senhaReset123' })
        .expect(200);
    });
  });
});
