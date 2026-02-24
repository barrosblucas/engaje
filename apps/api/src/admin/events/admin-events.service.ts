import {
  type AdminEventListRequest,
  AdminEventListRequestSchema,
  AdminRegistrationsRequestSchema,
  type AdminRegistrationsResponse,
  UpdateEventStatusInputSchema,
} from '@engaje/contracts';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import type { Prisma, RegistrationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { formatCpf } from '../../shared/cpf.util';
import { extractPlainTextFromHtml, sanitizeRichTextHtml } from '../../shared/rich-text-sanitizer';
import { generateSlug, generateUniqueSlug } from '../../shared/slug.util';
import {
  type CreateEventWithModeInput,
  CreateEventWithModeInputSchema,
  DynamicFormSchema,
  type UpdateEventWithModeInput,
  UpdateEventWithModeInputSchema,
} from '../../shared/super-admin.schemas';

/** Transições de status válidas para eventos. */
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['published', 'cancelled'],
  published: ['closed', 'cancelled'],
  closed: [],
  cancelled: [],
};

type EventWithDetails = Prisma.EventGetPayload<{
  include: {
    images: true;
    _count: { select: { registrations: true; attendanceIntents: true } };
  };
}>;

@Injectable()
export class AdminEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEventById(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        images: true,
        _count: {
          select: {
            registrations: { where: { status: 'confirmed' } },
            attendanceIntents: true,
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');
    return this.mapEventToDetail(event);
  }

  async getEventSlug(eventId: string): Promise<string | null> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { slug: true },
    });

    return event?.slug ?? null;
  }

  async createEvent(input: CreateEventWithModeInput, createdById: string) {
    const parsed = CreateEventWithModeInputSchema.parse(input);
    const sanitizedDescription = sanitizeRichTextHtml(parsed.description);

    if (extractPlainTextFromHtml(sanitizedDescription).length === 0) {
      throw new UnprocessableEntityException('Descrição pública inválida');
    }

    const baseSlug = generateSlug(parsed.title);

    const existingSlug = await this.prisma.event.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });
    const slug = existingSlug ? generateUniqueSlug(parsed.title, createId().slice(0, 6)) : baseSlug;

    const event = await this.prisma.event.create({
      data: {
        title: parsed.title,
        slug,
        description: sanitizedDescription,
        category: parsed.category,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        locationName: parsed.locationName,
        locationAddress: parsed.locationAddress,
        locationLat: parsed.locationLat,
        locationLng: parsed.locationLng,
        totalSlots: parsed.totalSlots,
        bannerUrl: parsed.bannerUrl ?? null,
        bannerAltText: parsed.bannerAltText,
        registrationMode: parsed.registrationMode,
        externalCtaLabel: parsed.externalCtaLabel ?? null,
        externalCtaUrl: parsed.externalCtaUrl ?? null,
        dynamicFormSchema: parsed.dynamicFormSchema
          ? (parsed.dynamicFormSchema as Prisma.InputJsonValue)
          : undefined,
        status: parsed.status ?? 'draft',
        createdById,
      },
      include: {
        images: true,
        _count: {
          select: {
            registrations: { where: { status: 'confirmed' } },
            attendanceIntents: true,
          },
        },
      },
    });

    return this.mapEventToDetail(event);
  }

  async updateEvent(id: string, input: UpdateEventWithModeInput) {
    const parsed = UpdateEventWithModeInputSchema.parse(input);

    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        registrationMode: true,
        dynamicFormSchema: true,
        totalSlots: true,
        _count: { select: { registrations: { where: { status: 'confirmed' } } } },
      },
    });
    if (!existing) throw new NotFoundException('Evento não encontrado');

    if (
      parsed.totalSlots !== undefined &&
      parsed.totalSlots !== null &&
      parsed.totalSlots < existing._count.registrations
    ) {
      throw new UnprocessableEntityException(
        `Não é possível reduzir vagas abaixo do número de inscrições confirmadas (${existing._count.registrations})`,
      );
    }

    const nextRegistrationMode = parsed.registrationMode ?? existing.registrationMode;
    const nextDynamicFormSchema =
      parsed.dynamicFormSchema === undefined
        ? existing.dynamicFormSchema
        : parsed.dynamicFormSchema;

    if (nextRegistrationMode === 'registration') {
      const nextFormSchemaParsed = DynamicFormSchema.safeParse(nextDynamicFormSchema);
      if (!nextFormSchemaParsed.success || nextFormSchemaParsed.data.fields.length === 0) {
        throw new UnprocessableEntityException(
          'Modo registration exige formulário dinâmico válido',
        );
      }
    }

    const data: Record<string, unknown> = { ...parsed };
    if (parsed.startDate) data.startDate = new Date(parsed.startDate);
    if (parsed.endDate) data.endDate = new Date(parsed.endDate);
    if (parsed.description !== undefined) {
      const sanitizedDescription = sanitizeRichTextHtml(parsed.description);
      if (extractPlainTextFromHtml(sanitizedDescription).length === 0) {
        throw new UnprocessableEntityException('Descrição pública inválida');
      }
      data.description = sanitizedDescription;
    }

    const event = await this.prisma.event.update({
      where: { id },
      data,
      include: {
        images: true,
        _count: {
          select: {
            registrations: { where: { status: 'confirmed' } },
            attendanceIntents: true,
          },
        },
      },
    });

    return this.mapEventToDetail(event);
  }

  async updateEventStatus(id: string, rawStatus: unknown) {
    const { status } = UpdateEventStatusInputSchema.parse({ status: rawStatus });

    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const allowed = VALID_TRANSITIONS[event.status] ?? [];
    if (!allowed.includes(status)) {
      throw new UnprocessableEntityException(`Transição inválida: ${event.status} → ${status}`);
    }

    if (status === 'cancelled') {
      await this.prisma.$transaction([
        this.prisma.registration.updateMany({
          where: { eventId: id, status: 'confirmed' },
          data: { status: 'cancelled', cancelledAt: new Date() },
        }),
        this.prisma.event.update({ where: { id }, data: { status } }),
      ]);
    } else {
      await this.prisma.event.update({ where: { id }, data: { status } });
    }

    const updated = await this.prisma.event.findUniqueOrThrow({
      where: { id },
      include: {
        images: true,
        _count: {
          select: {
            registrations: { where: { status: 'confirmed' } },
            attendanceIntents: true,
          },
        },
      },
    });

    return this.mapEventToDetail(updated);
  }

  async listEvents(query: AdminEventListRequest) {
    const parsed = AdminEventListRequestSchema.parse(query);
    const { page, limit, status, category, search } = parsed;

    const orderBy =
      parsed.sort === 'start_date_asc'
        ? { startDate: 'asc' as const }
        : parsed.sort === 'start_date_desc'
          ? { startDate: 'desc' as const }
          : { createdAt: 'desc' as const };

    const where = {
      ...(status && { status }),
      ...(category && { category }),
      ...(search && {
        OR: [{ title: { contains: search, mode: 'insensitive' as const } }],
      }),
    };

    const [total, events] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          status: true,
          startDate: true,
          totalSlots: true,
          createdAt: true,
          registrationMode: true,
          _count: { select: { registrations: { where: { status: 'confirmed' } } } },
        },
      }),
    ]);

    return {
      data: events.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        category: e.category,
        status: e.status,
        startDate: e.startDate.toISOString(),
        totalSlots: e.totalSlots,
        registeredCount: e._count.registrations,
        createdAt: e.createdAt.toISOString(),
        registrationMode: e.registrationMode,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listEventRegistrations(
    eventId: string,
    query: unknown,
  ): Promise<AdminRegistrationsResponse> {
    const parsed = AdminRegistrationsRequestSchema.parse(query);
    const { page, limit, status } = parsed;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const where: Prisma.RegistrationWhereInput = {
      eventId,
      ...(status ? { status: status as RegistrationStatus } : {}),
    };

    const [total, registrations] = await Promise.all([
      this.prisma.registration.count({ where }),
      this.prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, cpf: true, email: true, phone: true } },
        },
      }),
    ]);

    return {
      data: registrations.map((r) => ({
        id: r.id,
        protocolNumber: r.protocolNumber,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        cancelledAt: r.cancelledAt?.toISOString() ?? null,
        user: {
          id: r.user.id,
          name: r.user.name,
          cpf: r.user.cpf,
          email: r.user.email,
          phone: r.user.phone,
        },
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async exportRegistrationsCsv(eventId: string, status?: string): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const where: Prisma.RegistrationWhereInput = {
      eventId,
      ...(status === 'confirmed' || status === 'cancelled'
        ? { status: status as RegistrationStatus }
        : {}),
    };

    const registrations = await this.prisma.registration.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { name: true, cpf: true, email: true, phone: true } },
      },
    });

    const header = 'Nome,CPF,E-mail,Telefone,Protocolo,Status,Data de Inscrição';
    const rows = registrations.map((r) => {
      const cpfFormatted = r.user.cpf ? formatCpf(r.user.cpf) : '';
      const date = r.createdAt.toLocaleDateString('pt-BR');
      return [
        `"${r.user.name}"`,
        cpfFormatted,
        r.user.email,
        r.user.phone ?? '',
        r.protocolNumber,
        r.status === 'confirmed' ? 'Confirmado' : 'Cancelado',
        date,
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  private mapEventToDetail(event: EventWithDetails) {
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      category: event.category,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      locationName: event.locationName,
      locationAddress: event.locationAddress,
      locationLat: event.locationLat ?? null,
      locationLng: event.locationLng ?? null,
      bannerUrl: event.bannerUrl ?? null,
      bannerAltText: event.bannerAltText ?? null,
      totalSlots: event.totalSlots ?? null,
      status: event.status,
      availableSlots:
        event.totalSlots === null ? null : event.totalSlots - event._count.registrations,
      registrationMode: event.registrationMode,
      externalCtaLabel: event.externalCtaLabel ?? null,
      externalCtaUrl: event.externalCtaUrl ?? null,
      dynamicFormSchema: this.mapDynamicFormSchema(event.dynamicFormSchema),
      attendanceIntentCount: event._count.attendanceIntents,
      images: event.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        displayOrder: img.displayOrder,
      })),
      createdAt: event.createdAt.toISOString(),
    };
  }

  private mapDynamicFormSchema(dynamicFormSchema: Prisma.JsonValue | null) {
    if (dynamicFormSchema === null) return null;
    const parsed = DynamicFormSchema.safeParse(dynamicFormSchema);
    return parsed.success ? parsed.data : null;
  }
}
