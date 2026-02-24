import {
  type PublicEventsRequest,
  PublicEventsRequestSchema,
  type PublicEventsResponse,
} from '@engaje/contracts';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DynamicFormSchema } from '../../shared/super-admin.schemas';

@Injectable()
export class PublicEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedEvents(query: PublicEventsRequest): Promise<PublicEventsResponse> {
    const parsed = PublicEventsRequestSchema.parse(query);
    const { page, limit, category, startDate, endDate, search, sort } = parsed;

    const where: Prisma.EventWhereInput = {
      status: 'published',
      ...(category && { category }),
      ...(startDate && { startDate: { gte: new Date(startDate) } }),
      ...(endDate && { endDate: { lte: new Date(endDate) } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.EventOrderByWithRelationInput =
      sort === 'date_desc' ? { startDate: 'desc' } : { startDate: 'asc' };

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
          startDate: true,
          endDate: true,
          locationName: true,
          bannerUrl: true,
          bannerAltText: true,
          totalSlots: true,
          registrationMode: true,
          externalCtaLabel: true,
          externalCtaUrl: true,
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
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        locationName: e.locationName,
        bannerUrl: e.bannerUrl,
        bannerAltText: e.bannerAltText,
        availableSlots: e.totalSlots === null ? null : e.totalSlots - e._count.registrations,
        registrationMode: e.registrationMode,
        externalCtaLabel: e.externalCtaLabel,
        externalCtaUrl: e.externalCtaUrl,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEventBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, status: 'published' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        _count: {
          select: {
            registrations: { where: { status: 'confirmed' } },
            attendanceIntents: true,
          },
        },
      },
    });

    if (!event) throw new NotFoundException('Evento não encontrado');

    return {
      data: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        category: event.category,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        locationName: event.locationName,
        locationAddress: event.locationAddress,
        locationLat: event.locationLat,
        locationLng: event.locationLng,
        bannerUrl: event.bannerUrl,
        bannerAltText: event.bannerAltText,
        totalSlots: event.totalSlots,
        status: event.status,
        availableSlots:
          event.totalSlots === null ? null : event.totalSlots - event._count.registrations,
        registrationMode: event.registrationMode,
        externalCtaLabel: event.externalCtaLabel,
        externalCtaUrl: event.externalCtaUrl,
        dynamicFormSchema: this.mapDynamicFormSchema(event.dynamicFormSchema),
        attendanceIntentCount: event._count.attendanceIntents,
        images: event.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          displayOrder: img.displayOrder,
        })),
        createdAt: event.createdAt.toISOString(),
      },
    };
  }

  private mapDynamicFormSchema(dynamicFormSchema: Prisma.JsonValue | null) {
    if (dynamicFormSchema === null) return null;
    const parsed = DynamicFormSchema.safeParse(dynamicFormSchema);
    return parsed.success ? parsed.data : null;
  }
}
