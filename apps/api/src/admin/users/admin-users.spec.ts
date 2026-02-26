import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Admin Users API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminAgent: ReturnType<typeof request.agent>;
  let superAdminAgent: ReturnType<typeof request.agent>;

  const runId = `${Date.now()}`;
  const adminEmail = `test-admin-users-admin-${runId}@example.com`;
  const superAdminEmail = `test-admin-users-super-${runId}@example.com`;
  const adminPassword = 'senha12345';

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

    await prisma.passwordResetToken.deleteMany({
      where: { user: { email: { contains: runId } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: runId } } });

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        name: 'Admin Users Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      },
    });

    await prisma.user.create({
      data: {
        name: 'Admin Users Super Admin',
        email: superAdminEmail,
        passwordHash,
        role: 'super_admin',
      },
    });

    adminAgent = request.agent(app.getHttpServer());
    superAdminAgent = request.agent(app.getHttpServer());

    await adminAgent
      .post('/v1/auth/login')
      .send({ identifier: adminEmail, password: adminPassword })
      .expect(200);

    await superAdminAgent
      .post('/v1/auth/login')
      .send({ identifier: superAdminEmail, password: adminPassword })
      .expect(200);
  });

  afterAll(async () => {
    if (!prisma || !app) return;
    await prisma.passwordResetToken.deleteMany({
      where: { user: { email: { contains: runId } } },
    });
    await prisma.user.deleteMany({ where: { email: { contains: runId } } });
    await app.close();
  });

  it('admin cria usuário comum com CPF', async () => {
    const response = await adminAgent
      .post('/v1/admin/users')
      .send({
        name: 'Usuário Comum Teste',
        email: `test-admin-users-${runId}-citizen@example.com`,
        cpf: '16899535009',
        phone: '67999990000',
        password: 'SenhaForte123',
        role: 'citizen',
      })
      .expect(201);

    expect(response.body.user.role).toBe('citizen');
    expect(response.body.user.cpf).toBe('16899535009');
  });

  it('admin não pode criar administrador', async () => {
    await adminAgent
      .post('/v1/admin/users')
      .send({
        name: 'Administrador Bloqueado',
        email: `test-admin-users-${runId}-admin-blocked@example.com`,
        password: 'SenhaForte123',
        role: 'admin',
      })
      .expect(403);
  });

  it('super_admin pode criar administrador', async () => {
    const response = await superAdminAgent
      .post('/v1/admin/users')
      .send({
        name: 'Administrador Permitido',
        email: `test-admin-users-${runId}-admin-ok@example.com`,
        password: 'SenhaForte123',
        role: 'admin',
      })
      .expect(201);

    expect(response.body.user.role).toBe('admin');
    expect(response.body.user.cpf).toBeNull();
  });

  it('rejeita criação de comum sem CPF', async () => {
    await superAdminAgent
      .post('/v1/admin/users')
      .send({
        name: 'Comum Sem CPF',
        email: `test-admin-users-${runId}-citizen-without-cpf@example.com`,
        password: 'SenhaForte123',
        role: 'citizen',
      })
      .expect(400);
  });
});
