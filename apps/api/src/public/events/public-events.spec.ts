import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Public Events API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminUserId: string;
  let publishedEventId: string;
  let publishedSlug: string;

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

    // Create admin user for tests
    const bcrypt = await import('bcryptjs');
    const admin = await prisma.user.create({
      data: {
        name: 'Admin Test Public',
        email: 'test-pub-admin@example.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
      },
    });
    adminUserId = admin.id;

    // Login to verify auth works (cookie not used in public tests)
    await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ identifier: admin.email, password: 'admin123' });

    // Create published event
    const event = await prisma.event.create({
      data: {
        title: 'Teste Evento Publicado',
        slug: 'teste-evento-publicado',
        description: 'Descrição do evento de teste para listagem pública',
        category: 'cultura',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        locationName: 'Centro de Eventos',
        locationAddress: 'Rua Principal, 100',
        status: 'published',
        createdById: adminUserId,
      },
    });
    publishedEventId = event.id;
    publishedSlug = event.slug;
  });

  afterAll(async () => {
    await prisma.registration.deleteMany({
      where: { event: { createdById: adminUserId } },
    });
    await prisma.event.deleteMany({ where: { createdById: adminUserId } });
    await prisma.user.deleteMany({ where: { email: { contains: 'test-pub' } } });
    await app.close();
  });

  describe('GET /v1/public/events', () => {
    it('lista eventos publicados', async () => {
      const res = await request(app.getHttpServer()).get('/v1/public/events').expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('filtra por categoria', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/public/events?category=cultura')
        .expect(200);

      expect(res.body.data.every((e: { category: string }) => e.category === 'cultura')).toBe(true);
    });

    it('busca por texto', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/public/events?search=Publicado')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('pagina resultados', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/public/events?page=1&limit=2')
        .expect(200);

      expect(res.body.meta.limit).toBe(2);
    });
  });

  describe('GET /v1/public/events/:slug', () => {
    it('retorna detalhe do evento', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/public/events/${publishedSlug}`)
        .expect(200);

      expect(res.body.data.id).toBe(publishedEventId);
      expect(res.body.data.images).toBeInstanceOf(Array);
    });

    it('retorna 404 para slug inexistente', async () => {
      await request(app.getHttpServer()).get('/v1/public/events/slug-inexistente-xyz').expect(404);
    });
  });
});
