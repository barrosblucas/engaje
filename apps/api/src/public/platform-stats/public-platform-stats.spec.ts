import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Public Platform Stats API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminId = '';
  let citizenId = '';
  let eventId = '';
  let programId = '';

  const runId = `${Date.now()}`;
  const adminEmail = `test-pub-stats-admin-${runId}@example.com`;
  const citizenEmail = `test-pub-stats-citizen-${runId}@example.com`;

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

    const passwordHash = await bcrypt.hash('stats123', 12);

    const admin = await prisma.user.create({
      data: {
        name: 'Public Stats Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      },
    });
    adminId = admin.id;

    const citizen = await prisma.user.create({
      data: {
        name: 'Public Stats Citizen',
        email: citizenEmail,
        passwordHash,
        role: 'citizen',
      },
    });
    citizenId = citizen.id;
  });

  afterAll(async () => {
    if (eventId) {
      await prisma.registration.deleteMany({ where: { eventId } });
      await prisma.event.deleteMany({ where: { id: eventId } });
    }

    if (programId) {
      await prisma.programRegistration.deleteMany({ where: { programId } });
      await prisma.program.deleteMany({ where: { id: programId } });
    }

    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, citizenEmail] } } });
    await app.close();
  });

  it('returns real aggregated counts for events, registrations and programs', async () => {
    const baseline = await request(app.getHttpServer())
      .get('/v1/public/platform-stats')
      .expect(200);

    const baselineEventsCount = baseline.body.data.eventsCount as number;
    const baselineRegistrationsCount = baseline.body.data.registrationsCount as number;
    const baselineProgramsCount = baseline.body.data.activeProgramsCount as number;

    const createdEvent = await prisma.event.create({
      data: {
        title: `Evento Stats ${runId}`,
        slug: `evento-stats-${runId}`,
        description: 'Evento de teste para agregacao de metricas publicas',
        category: 'cultura',
        startDate: new Date('2026-06-01T10:00:00.000Z'),
        endDate: new Date('2026-06-01T12:00:00.000Z'),
        locationName: 'Centro Comunitario',
        locationAddress: 'Rua das Flores, 10',
        status: 'published',
        registrationMode: 'registration',
        createdById: adminId,
      },
    });
    eventId = createdEvent.id;

    const createdProgram = await prisma.program.create({
      data: {
        title: `Programa Stats ${runId}`,
        slug: `programa-stats-${runId}`,
        description: 'Programa de teste para agregacao de metricas publicas',
        category: 'educacao',
        startDate: new Date('2026-06-05T10:00:00.000Z'),
        endDate: new Date('2026-07-05T10:00:00.000Z'),
        status: 'published',
        registrationMode: 'registration',
        createdById: adminId,
      },
    });
    programId = createdProgram.id;

    await prisma.registration.create({
      data: {
        eventId,
        userId: citizenId,
        protocolNumber: `EVT-${runId}-00001`,
        status: 'confirmed',
        formData: { nome: 'Cidadao' },
      },
    });

    await prisma.programRegistration.create({
      data: {
        programId,
        userId: citizenId,
        protocolNumber: `PRG-${runId}-00001`,
        status: 'confirmed',
        formData: { renda: '2_salarios' },
      },
    });

    const response = await request(app.getHttpServer())
      .get('/v1/public/platform-stats')
      .expect(200);

    expect(response.body.data).toEqual({
      eventsCount: baselineEventsCount + 1,
      registrationsCount: baselineRegistrationsCount + 2,
      activeProgramsCount: baselineProgramsCount + 1,
    });
  });
});
