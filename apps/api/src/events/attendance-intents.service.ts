import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceIntentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIntent(eventId: string, userId: string) {
    await this.ensureEventIsPublished(eventId);

    const [, attendeeCount] = await this.prisma.$transaction([
      this.prisma.eventAttendanceIntent.upsert({
        where: { eventId_userId: { eventId, userId } },
        create: { eventId, userId },
        update: {},
      }),
      this.prisma.eventAttendanceIntent.count({ where: { eventId } }),
    ]);

    return {
      data: {
        eventId,
        hasIntent: true,
        attendeeCount,
      },
    };
  }

  async deleteIntent(eventId: string, userId: string) {
    await this.ensureEventIsPublished(eventId);

    const [, attendeeCount] = await this.prisma.$transaction([
      this.prisma.eventAttendanceIntent.deleteMany({ where: { eventId, userId } }),
      this.prisma.eventAttendanceIntent.count({ where: { eventId } }),
    ]);

    return {
      data: {
        eventId,
        hasIntent: false,
        attendeeCount,
      },
    };
  }

  async getIntentState(eventId: string, userId: string) {
    await this.ensureEventIsPublished(eventId);

    const [intent, attendeeCount] = await Promise.all([
      this.prisma.eventAttendanceIntent.findUnique({
        where: { eventId_userId: { eventId, userId } },
        select: { id: true },
      }),
      this.prisma.eventAttendanceIntent.count({ where: { eventId } }),
    ]);

    return {
      data: {
        eventId,
        hasIntent: Boolean(intent),
        attendeeCount,
      },
    };
  }

  private async ensureEventIsPublished(eventId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event || event.status !== 'published') {
      throw new NotFoundException('Evento não encontrado ou não está publicado');
    }
  }
}
