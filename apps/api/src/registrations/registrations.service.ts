import type { CreateRegistrationResponse, UserRegistrationsResponse } from '@engaje/contracts';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateEventProtocol } from '../shared/protocol.util';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRegistration(userId: string, eventId: string): Promise<CreateRegistrationResponse> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, totalSlots: true },
    });

    if (!event || event.status !== 'published') {
      throw new NotFoundException('Evento não encontrado ou não está publicado');
    }

    const existing = await this.prisma.registration.findUnique({
      where: { eventId_userId: { eventId, userId } },
      select: { id: true, status: true },
    });

    if (existing) {
      throw new ConflictException('Você já está inscrito neste evento');
    }

    // Verificação atômica de vagas para evitar overbooking
    if (event.totalSlots !== null) {
      const confirmedCount = await this.prisma.registration.count({
        where: { eventId, status: 'confirmed' },
      });
      if (confirmedCount >= event.totalSlots) {
        throw new UnprocessableEntityException('Vagas esgotadas');
      }
    }

    const protocolNumber = generateEventProtocol();
    const registration = await this.prisma.registration.create({
      data: { eventId, userId, protocolNumber, status: 'confirmed' },
      select: {
        id: true,
        eventId: true,
        userId: true,
        protocolNumber: true,
        status: true,
        createdAt: true,
        cancelledAt: true,
      },
    });

    return {
      registration: {
        id: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        protocolNumber: registration.protocolNumber,
        status: registration.status,
        createdAt: registration.createdAt.toISOString(),
        cancelledAt: registration.cancelledAt?.toISOString() ?? null,
      },
    };
  }

  async getUserRegistrations(
    userId: string,
    page: number,
    limit: number,
  ): Promise<UserRegistrationsResponse> {
    const [total, registrations] = await Promise.all([
      this.prisma.registration.count({ where: { userId } }),
      this.prisma.registration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              endDate: true,
              locationName: true,
              bannerUrl: true,
            },
          },
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
        event: {
          id: r.event.id,
          title: r.event.title,
          slug: r.event.slug,
          startDate: r.event.startDate.toISOString(),
          endDate: r.event.endDate.toISOString(),
          locationName: r.event.locationName,
          bannerUrl: r.event.bannerUrl,
        },
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancelRegistration(registrationId: string, userId: string): Promise<void> {
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, userId },
      include: { event: { select: { startDate: true } } },
    });

    if (!registration) {
      throw new NotFoundException('Inscrição não encontrada');
    }
    if (registration.status === 'cancelled') {
      throw new ConflictException('Inscrição já foi cancelada');
    }
    if (registration.event.startDate < new Date()) {
      throw new UnprocessableEntityException(
        'Não é possível cancelar inscrição de evento já realizado',
      );
    }

    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }
}
