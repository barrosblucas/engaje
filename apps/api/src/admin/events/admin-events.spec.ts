import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

jest.setTimeout(30_000);

describe('Admin Events API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminId: string;
  let eventId: string;

  const adminEmail = 'test-admin-events-admin@example.com';
  const citizenEmail = 'test-admin-events-citizen@example.com';
  const password = 'senha12345';

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

    await prisma.registration.deleteMany({});
    await prisma.eventImage.deleteMany({});
    await prisma.event.deleteMany({ where: { slug: 'evento-admin-test' } });
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, citizenEmail] } } });

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin Events Test',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      },
    });
    adminId = admin.id;

    await prisma.user.create({
      data: {
        name: 'Citizen Events Test',
        email: citizenEmail,
        passwordHash,
        role: 'citizen',
        cpf: '01987654322',
      },
    });

    const event = await prisma.event.create({
      data: {
        title: 'Evento Admin Test',
        slug: 'evento-admin-test',
        description: 'Descricao do evento para teste da rota admin por id',
        category: 'cultura',
        startDate: new Date('2026-03-01T12:00:00.000Z'),
        endDate: new Date('2026-03-01T14:00:00.000Z'),
        locationName: 'Praca Central',
        locationAddress: 'Rua Principal, 100',
        status: 'draft',
        totalSlots: 30,
        createdById: adminId,
      },
    });
    eventId = event.id;
  });

  afterAll(async () => {
    if (!prisma || !app) return;
    await prisma.registration.deleteMany({});
    await prisma.eventImage.deleteMany({});
    await prisma.event.deleteMany({ where: { slug: 'evento-admin-test' } });
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, citizenEmail] } } });
    await app.close();
  });

  it('GET /v1/admin/events/:id retorna detalhe para admin autenticado', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/v1/auth/login').send({ identifier: adminEmail, password }).expect(200);

    const res = await agent.get(`/v1/admin/events/${eventId}`).expect(200);

    expect(res.body.id).toBe(eventId);
    expect(res.body.title).toBe('Evento Admin Test');
    expect(res.body.images).toBeInstanceOf(Array);
    expect(res.body.status).toBe('draft');
  });

  it('GET /v1/admin/events/:id retorna 404 quando evento nao existe', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/v1/auth/login').send({ identifier: adminEmail, password }).expect(200);

    await agent.get('/v1/admin/events/id-inexistente').expect(404);
  });

  it('GET /v1/admin/events/:id retorna 403 para cidadao autenticado', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/v1/auth/login').send({ identifier: citizenEmail, password }).expect(200);

    await agent.get(`/v1/admin/events/${eventId}`).expect(403);
  });
});
