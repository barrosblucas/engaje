import {
  type PublicPlatformStatsResponse,
  PublicPlatformStatsResponseSchema,
} from '@engaje/contracts';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicPlatformStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats(): Promise<PublicPlatformStatsResponse> {
    const [eventsCount, activeProgramsCount, eventRegistrationsCount, programRegistrationsCount] =
      await Promise.all([
        this.prisma.event.count({ where: { status: 'published' } }),
        this.prisma.program.count({ where: { status: 'published' } }),
        this.prisma.registration.count({ where: { status: 'confirmed' } }),
        this.prisma.programRegistration.count({ where: { status: 'confirmed' } }),
      ]);

    return PublicPlatformStatsResponseSchema.parse({
      data: {
        eventsCount,
        registrationsCount: eventRegistrationsCount + programRegistrationsCount,
        activeProgramsCount,
      },
    });
  }
}
