import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DynamicFormSchema,
  type PublicProgramsRequestLocal,
  PublicProgramsRequestSchemaLocal,
} from '../../shared/super-admin.schemas';

@Injectable()
export class PublicProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedPrograms(query: PublicProgramsRequestLocal) {
    const parsed = PublicProgramsRequestSchemaLocal.parse(query);
    const { page, limit, category, search, sort } = parsed;

    const where: Prisma.ProgramWhereInput = {
      status: 'published',
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.ProgramOrderByWithRelationInput =
      sort === 'date_desc' ? { startDate: 'desc' } : { startDate: 'asc' };

    const [total, programs] = await Promise.all([
      this.prisma.program.count({ where }),
      this.prisma.program.findMany({
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
      data: programs.map((program) => ({
        id: program.id,
        title: program.title,
        slug: program.slug,
        category: program.category,
        startDate: program.startDate.toISOString(),
        endDate: program.endDate.toISOString(),
        bannerUrl: program.bannerUrl,
        bannerAltText: program.bannerAltText,
        availableSlots:
          program.totalSlots === null ? null : program.totalSlots - program._count.registrations,
        registrationMode: program.registrationMode,
        externalCtaLabel: program.externalCtaLabel,
        externalCtaUrl: program.externalCtaUrl,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProgramBySlug(slug: string) {
    const program = await this.prisma.program.findFirst({
      where: { slug, status: 'published' },
      include: {
        _count: { select: { registrations: { where: { status: 'confirmed' } } } },
      },
    });

    if (!program) throw new NotFoundException('Programa não encontrado');

    return {
      data: {
        id: program.id,
        title: program.title,
        slug: program.slug,
        category: program.category,
        description: program.description,
        startDate: program.startDate.toISOString(),
        endDate: program.endDate.toISOString(),
        bannerUrl: program.bannerUrl,
        bannerAltText: program.bannerAltText,
        availableSlots:
          program.totalSlots === null ? null : program.totalSlots - program._count.registrations,
        registrationMode: program.registrationMode,
        externalCtaLabel: program.externalCtaLabel,
        externalCtaUrl: program.externalCtaUrl,
        totalSlots: program.totalSlots,
        status: program.status,
        dynamicFormSchema: this.mapDynamicFormSchema(program.dynamicFormSchema),
        createdAt: program.createdAt.toISOString(),
      },
    };
  }

  private mapDynamicFormSchema(dynamicFormSchema: Prisma.JsonValue | null) {
    if (dynamicFormSchema === null) return null;
    const parsed = DynamicFormSchema.safeParse(dynamicFormSchema);
    return parsed.success ? parsed.data : null;
  }
}
