import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

jest.setTimeout(40_000);

describe('Super Admin plan backend (integration)', () => {
  type RequestAgent = ReturnType<typeof request.agent>;

  let app: INestApplication;
  let prisma: PrismaService;
  let adminAgent: RequestAgent;
  let citizenAgent: RequestAgent;
  let citizenTwoAgent: RequestAgent;

  let adminId = '';
  let citizenId = '';

  let registrationEventId = '';
  let registrationEventSlug = '';
  let informativeEventId = '';
  let informativeEventSlug = '';
  let citizenRegistrationId = '';

  let registrationProgramId = '';
  let registrationProgramSlug = '';
  let informativeProgramId = '';
  let informativeProgramSlug = '';

  const runId = `${Date.now()}`;
  const password = 'senha12345';
  const adminEmail = `test-super-admin-${runId}@example.com`;
  const citizenEmail = `test-super-citizen-${runId}@example.com`;
  const citizenTwoEmail = `test-super-citizen-two-${runId}@example.com`;

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

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin Plan',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      },
    });
    adminId = admin.id;

    const citizen = await prisma.user.create({
      data: {
        name: 'Citizen Plan One',
        email: citizenEmail,
        passwordHash,
        role: 'citizen',
      },
    });
    citizenId = citizen.id;

    await prisma.user.create({
      data: {
        name: 'Citizen Plan Two',
        email: citizenTwoEmail,
        passwordHash,
        role: 'citizen',
      },
    });

    adminAgent = request.agent(app.getHttpServer());
    citizenAgent = request.agent(app.getHttpServer());
    citizenTwoAgent = request.agent(app.getHttpServer());

    await adminAgent.post('/v1/auth/login').send({ identifier: adminEmail, password }).expect(200);
    await citizenAgent
      .post('/v1/auth/login')
      .send({ identifier: citizenEmail, password })
      .expect(200);
    await citizenTwoAgent
      .post('/v1/auth/login')
      .send({ identifier: citizenTwoEmail, password })
      .expect(200);
  });

  afterAll(async () => {
    const eventIds = (
      await prisma.event.findMany({
        where: { createdById: adminId },
        select: { id: true },
      })
    ).map((event) => event.id);

    const programIds = (
      await prisma.program.findMany({
        where: { createdById: adminId },
        select: { id: true },
      })
    ).map((program) => program.id);

    if (eventIds.length > 0) {
      await prisma.eventAttendanceIntent.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.registration.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.eventImage.deleteMany({ where: { eventId: { in: eventIds } } });
      await prisma.event.deleteMany({ where: { id: { in: eventIds } } });
    }

    if (programIds.length > 0) {
      await prisma.programRegistration.deleteMany({ where: { programId: { in: programIds } } });
      await prisma.program.deleteMany({ where: { id: { in: programIds } } });
    }

    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, citizenEmail, citizenTwoEmail] } },
    });
    await app.close();
  });

  it('admin creates events in registration and informative modes', async () => {
    const registrationEventPayload = {
      title: `Evento Inscrição ${runId}`,
      category: 'cultura',
      description:
        '<p>Evento com inscrição e formulário dinâmico para cidadãos <script>alert(1)</script></p>',
      startDate: '2026-04-10T10:00:00.000Z',
      endDate: '2026-04-10T12:00:00.000Z',
      locationName: 'Centro Cultural',
      locationAddress: 'Rua Principal, 100',
      totalSlots: 50,
      registrationMode: 'registration',
      dynamicFormSchema: {
        fields: [
          { id: 'nome_social', type: 'short_text', label: 'Nome social', required: true },
          { id: 'aceite_termos', type: 'terms', label: 'Aceite dos termos', required: true },
        ],
      },
      status: 'published',
    };

    const registrationEventResponse = await adminAgent
      .post('/v1/admin/events')
      .send(registrationEventPayload)
      .expect(201);

    registrationEventId = registrationEventResponse.body.id;
    registrationEventSlug = registrationEventResponse.body.slug;

    expect(registrationEventResponse.body.registrationMode).toBe('registration');
    expect(registrationEventResponse.body.dynamicFormSchema.fields).toHaveLength(2);
    expect(registrationEventResponse.body.externalCtaLabel).toBeNull();
    expect(registrationEventResponse.body.attendanceIntentCount).toBe(0);
    expect(registrationEventResponse.body.description).not.toContain('<script');

    const informativeEventPayload = {
      title: `Evento Informativo ${runId}`,
      category: 'educacao',
      description: 'Evento apenas informativo com CTA externo',
      startDate: '2026-04-11T10:00:00.000Z',
      endDate: '2026-04-11T11:30:00.000Z',
      locationName: 'Auditório Municipal',
      locationAddress: 'Avenida Central, 500',
      registrationMode: 'informative',
      externalCtaLabel: 'Saiba mais',
      externalCtaUrl: 'https://prefeitura.example/evento-informativo',
      status: 'published',
    };

    const informativeEventResponse = await adminAgent
      .post('/v1/admin/events')
      .send(informativeEventPayload)
      .expect(201);

    informativeEventId = informativeEventResponse.body.id;
    informativeEventSlug = informativeEventResponse.body.slug;

    expect(informativeEventResponse.body.registrationMode).toBe('informative');
    expect(informativeEventResponse.body.externalCtaLabel).toBe('Saiba mais');
    expect(informativeEventResponse.body.externalCtaUrl).toBe(
      'https://prefeitura.example/evento-informativo',
    );
    expect(informativeEventResponse.body.dynamicFormSchema).toBeNull();
  });

  it('admin creates, lists, details and updates programs', async () => {
    const registrationProgramPayload = {
      title: `Programa Inscrição ${runId}`,
      category: 'educacao',
      description:
        '<p>Programa público com inscrição e formulário de elegibilidade <script>alert(1)</script></p>',
      startDate: '2026-05-01T09:00:00.000Z',
      endDate: '2026-08-01T18:00:00.000Z',
      totalSlots: 100,
      registrationMode: 'registration',
      dynamicFormSchema: {
        fields: [{ id: 'renda_familiar', type: 'number', label: 'Renda familiar', required: true }],
      },
      status: 'published',
    };

    const registrationProgramResponse = await adminAgent
      .post('/v1/admin/programs')
      .send(registrationProgramPayload)
      .expect(201);

    registrationProgramId = registrationProgramResponse.body.id;
    registrationProgramSlug = registrationProgramResponse.body.slug;

    expect(registrationProgramResponse.body.registrationMode).toBe('registration');
    expect(registrationProgramResponse.body.dynamicFormSchema.fields[0].id).toBe('renda_familiar');
    expect(registrationProgramResponse.body.description).not.toContain('<script');

    const informativeProgramPayload = {
      title: `Programa Informativo ${runId}`,
      category: 'saude',
      description: 'Programa com informações públicas e inscrição externa',
      startDate: '2026-05-10T09:00:00.000Z',
      endDate: '2026-09-10T18:00:00.000Z',
      registrationMode: 'informative',
      externalCtaLabel: 'Acessar portal',
      externalCtaUrl: 'https://prefeitura.example/programa-informativo',
      status: 'published',
    };

    const informativeProgramResponse = await adminAgent
      .post('/v1/admin/programs')
      .send(informativeProgramPayload)
      .expect(201);

    informativeProgramId = informativeProgramResponse.body.id;
    informativeProgramSlug = informativeProgramResponse.body.slug;

    expect(informativeProgramResponse.body.registrationMode).toBe('informative');
    expect(informativeProgramResponse.body.externalCtaLabel).toBe('Acessar portal');
    expect(informativeProgramResponse.body.dynamicFormSchema).toBeNull();

    const listResponse = await adminAgent.get('/v1/admin/programs').expect(200);
    expect(listResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: registrationProgramId }),
        expect.objectContaining({ id: informativeProgramId }),
      ]),
    );

    const detailResponse = await adminAgent
      .get(`/v1/admin/programs/${registrationProgramId}`)
      .expect(200);
    expect(detailResponse.body.id).toBe(registrationProgramId);
    expect(detailResponse.body.registrationMode).toBe('registration');

    const updateResponse = await adminAgent
      .patch(`/v1/admin/programs/${registrationProgramId}`)
      .send({ title: `Programa Inscrição ${runId} Atualizado` })
      .expect(200);
    expect(updateResponse.body.title).toContain('Atualizado');
  });

  it('public event and program details expose mode, cta and dynamic form fields', async () => {
    const registrationEventDetail = await request(app.getHttpServer())
      .get(`/v1/public/events/${registrationEventSlug}`)
      .expect(200);
    expect(registrationEventDetail.body.data.registrationMode).toBe('registration');
    expect(registrationEventDetail.body.data.dynamicFormSchema.fields).toHaveLength(2);
    expect(registrationEventDetail.body.data.attendanceIntentCount).toBe(0);

    const informativeEventDetail = await request(app.getHttpServer())
      .get(`/v1/public/events/${informativeEventSlug}`)
      .expect(200);
    expect(informativeEventDetail.body.data.registrationMode).toBe('informative');
    expect(informativeEventDetail.body.data.externalCtaLabel).toBe('Saiba mais');
    expect(informativeEventDetail.body.data.externalCtaUrl).toBe(
      'https://prefeitura.example/evento-informativo',
    );
    expect(informativeEventDetail.body.data.dynamicFormSchema).toBeNull();

    const programsList = await request(app.getHttpServer()).get('/v1/public/programs').expect(200);
    expect(programsList.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: registrationProgramSlug }),
        expect.objectContaining({ slug: informativeProgramSlug }),
      ]),
    );

    const registrationProgramDetail = await request(app.getHttpServer())
      .get(`/v1/public/programs/${registrationProgramSlug}`)
      .expect(200);
    expect(registrationProgramDetail.body.data.registrationMode).toBe('registration');
    expect(registrationProgramDetail.body.data.dynamicFormSchema.fields[0].id).toBe(
      'renda_familiar',
    );

    const informativeProgramDetail = await request(app.getHttpServer())
      .get(`/v1/public/programs/${informativeProgramSlug}`)
      .expect(200);
    expect(informativeProgramDetail.body.data.registrationMode).toBe('informative');
    expect(informativeProgramDetail.body.data.externalCtaLabel).toBe('Acessar portal');
    expect(informativeProgramDetail.body.data.externalCtaUrl).toBe(
      'https://prefeitura.example/programa-informativo',
    );
    expect(informativeProgramDetail.body.data.dynamicFormSchema).toBeNull();
  });

  it('POST /v1/registrations persists formData and validates required dynamic fields', async () => {
    const registrationPayload = {
      eventId: registrationEventId,
      formData: {
        nome_social: 'Maria da Silva',
        aceite_termos: true,
      },
    };

    const registrationResponse = await citizenAgent
      .post('/v1/registrations')
      .send(registrationPayload)
      .expect(201);

    citizenRegistrationId = registrationResponse.body.registration.id;
    expect(registrationResponse.body.registration.formData).toEqual(registrationPayload.formData);

    const saved = await prisma.registration.findUnique({
      where: { eventId_userId: { eventId: registrationEventId, userId: citizenId } },
      select: { formData: true },
    });
    expect(saved?.formData).toMatchObject(registrationPayload.formData);

    await citizenTwoAgent
      .post('/v1/registrations')
      .send({
        eventId: registrationEventId,
        formData: { nome_social: 'João sem termos' },
      })
      .expect(422);

    await citizenTwoAgent
      .post('/v1/registrations')
      .send({
        eventId: informativeEventId,
        formData: {},
      })
      .expect(422);
  });

  it('GET /v1/registrations/:id returns proof and submitted form data for owner only', async () => {
    const detailResponse = await citizenAgent
      .get(`/v1/registrations/${citizenRegistrationId}`)
      .expect(200);

    expect(detailResponse.body.data.id).toBe(citizenRegistrationId);
    expect(detailResponse.body.data.protocolNumber).toBeTruthy();
    expect(detailResponse.body.data.formData).toEqual({
      nome_social: 'Maria da Silva',
      aceite_termos: true,
    });
    expect(detailResponse.body.data.event.dynamicFormSchema.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'nome_social' }),
        expect.objectContaining({ id: 'aceite_termos' }),
      ]),
    );

    await citizenTwoAgent.get(`/v1/registrations/${citizenRegistrationId}`).expect(404);
  });

  it('attendance intents create/delete/state without duplicate rows per user and event', async () => {
    const initialState = await citizenAgent
      .get(`/v1/events/${registrationEventId}/attendance-intents/me`)
      .expect(200);
    expect(initialState.body.data).toEqual({
      eventId: registrationEventId,
      hasIntent: false,
      attendeeCount: 0,
    });

    const createdState = await citizenAgent
      .post(`/v1/events/${registrationEventId}/attendance-intents`)
      .expect(200);
    expect(createdState.body.data).toEqual({
      eventId: registrationEventId,
      hasIntent: true,
      attendeeCount: 1,
    });

    const duplicatedState = await citizenAgent
      .post(`/v1/events/${registrationEventId}/attendance-intents`)
      .expect(200);
    expect(duplicatedState.body.data.attendeeCount).toBe(1);
    expect(duplicatedState.body.data.hasIntent).toBe(true);

    const dbCount = await prisma.eventAttendanceIntent.count({
      where: { eventId: registrationEventId, userId: citizenId },
    });
    expect(dbCount).toBe(1);

    const deletedState = await citizenAgent
      .delete(`/v1/events/${registrationEventId}/attendance-intents`)
      .expect(200);
    expect(deletedState.body.data).toEqual({
      eventId: registrationEventId,
      hasIntent: false,
      attendeeCount: 0,
    });

    await citizenAgent.delete(`/v1/events/${registrationEventId}/attendance-intents`).expect(200);

    const finalState = await citizenAgent
      .get(`/v1/events/${registrationEventId}/attendance-intents/me`)
      .expect(200);
    expect(finalState.body.data).toEqual({
      eventId: registrationEventId,
      hasIntent: false,
      attendeeCount: 0,
    });
  });
});
