import type { UserRegistrationDetailResponse, UserRegistrationsResponse } from '@engaje/contracts';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateEventProtocol } from '../shared/protocol.util';
import { type DynamicFormField, DynamicFormSchema } from '../shared/super-admin.schemas';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRegistration(userId: string, eventId: string, formData?: Record<string, unknown>) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        status: true,
        totalSlots: true,
        registrationMode: true,
        dynamicFormSchema: true,
      },
    });

    if (!event || event.status !== 'published') {
      throw new NotFoundException('Evento não encontrado ou não está publicado');
    }

    if (event.registrationMode === 'informative') {
      throw new UnprocessableEntityException(
        'Este evento está em modo informativo e não aceita inscrições',
      );
    }

    const dynamicFormSchema = this.parseDynamicFormSchema(event.dynamicFormSchema);
    this.validateRequiredFields(dynamicFormSchema.fields, formData);

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
      data: {
        eventId,
        userId,
        protocolNumber,
        status: 'confirmed',
        formData: formData ? (formData as Prisma.InputJsonValue) : undefined,
      },
      select: {
        id: true,
        eventId: true,
        userId: true,
        protocolNumber: true,
        status: true,
        formData: true,
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
        formData: this.mapFormData(registration.formData),
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

  async getUserRegistrationById(
    userId: string,
    registrationId: string,
  ): Promise<UserRegistrationDetailResponse> {
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, userId },
      select: {
        id: true,
        protocolNumber: true,
        status: true,
        formData: true,
        createdAt: true,
        cancelledAt: true,
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            locationName: true,
            locationAddress: true,
            bannerUrl: true,
            dynamicFormSchema: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Inscrição não encontrada');
    }

    return {
      data: {
        id: registration.id,
        protocolNumber: registration.protocolNumber,
        status: registration.status,
        formData: this.mapFormData(registration.formData),
        createdAt: registration.createdAt.toISOString(),
        cancelledAt: registration.cancelledAt?.toISOString() ?? null,
        event: {
          id: registration.event.id,
          title: registration.event.title,
          slug: registration.event.slug,
          startDate: registration.event.startDate.toISOString(),
          endDate: registration.event.endDate.toISOString(),
          locationName: registration.event.locationName,
          locationAddress: registration.event.locationAddress,
          bannerUrl: registration.event.bannerUrl,
          dynamicFormSchema: this.mapDynamicFormSchema(registration.event.dynamicFormSchema),
        },
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

  private parseDynamicFormSchema(dynamicFormSchema: Prisma.JsonValue | null) {
    const parsed = DynamicFormSchema.safeParse(dynamicFormSchema);
    if (!parsed.success || parsed.data.fields.length === 0) {
      throw new UnprocessableEntityException('Evento sem formulário de inscrição configurado');
    }
    return parsed.data;
  }

  private validateRequiredFields(
    fields: DynamicFormField[],
    formData?: Record<string, unknown>,
  ): void {
    const missingRequiredFieldIds = fields
      .filter((field) => field.required)
      .filter((field) => !this.isRequiredFieldFilled(field.type, formData?.[field.id]))
      .map((field) => field.id);

    if (missingRequiredFieldIds.length > 0) {
      throw new UnprocessableEntityException(
        `Campos obrigatórios não preenchidos: ${missingRequiredFieldIds.join(', ')}`,
      );
    }
  }

  private isRequiredFieldFilled(type: string, value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if ((type === 'checkbox' || type === 'terms') && value !== true) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  private mapFormData(formData: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) {
      return null;
    }
    return formData as Record<string, unknown>;
  }

  private mapDynamicFormSchema(dynamicFormSchema: Prisma.JsonValue | null) {
    const parsed = DynamicFormSchema.safeParse(dynamicFormSchema);
    return parsed.success ? parsed.data : null;
  }
}
