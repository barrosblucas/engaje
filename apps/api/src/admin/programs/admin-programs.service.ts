import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { extractPlainTextFromHtml, sanitizeRichTextHtml } from '../../shared/rich-text-sanitizer';
import { generateSlug, generateUniqueSlug } from '../../shared/slug.util';
import {
  type AdminProgramListRequestLocal,
  AdminProgramListRequestSchemaLocal,
  type CreateProgramInputLocal,
  CreateProgramInputSchemaLocal,
  DynamicFormSchema,
  type UpdateProgramInputLocal,
  UpdateProgramInputSchemaLocal,
} from '../../shared/super-admin.schemas';

type ProgramWithDetails = Prisma.ProgramGetPayload<{
  include: {
    _count: { select: { registrations: true } };
  };
}>;

@Injectable()
export class AdminProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureHomeHighlightCompatibility(
    status: 'draft' | 'published' | 'closed' | 'cancelled',
    isHighlightedOnHome: boolean,
  ) {
    if (isHighlightedOnHome && status !== 'published') {
      throw new UnprocessableEntityException(
        'Somente programas publicados podem ficar ativos na página inicial',
      );
    }
  }

  async createProgram(input: CreateProgramInputLocal, createdById: string) {
    const parsed = CreateProgramInputSchemaLocal.parse(input);
    const sanitizedDescription = sanitizeRichTextHtml(parsed.description);

    if (extractPlainTextFromHtml(sanitizedDescription).length === 0) {
      throw new UnprocessableEntityException('Descrição pública inválida');
    }

    const baseSlug = generateSlug(parsed.title);

    const existingSlug = await this.prisma.program.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });
    const slug = existingSlug ? generateUniqueSlug(parsed.title, createId().slice(0, 6)) : baseSlug;
    const nextStatus = parsed.status ?? 'draft';
    const shouldHighlightOnHome = parsed.isHighlightedOnHome ?? false;
    this.ensureHomeHighlightCompatibility(nextStatus, shouldHighlightOnHome);

    const createData: Prisma.ProgramCreateInput = {
      title: parsed.title,
      slug,
      description: sanitizedDescription,
      category: parsed.category,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      totalSlots: parsed.totalSlots,
      bannerUrl: parsed.bannerUrl ?? null,
      bannerAltText: parsed.bannerAltText,
      registrationMode: parsed.registrationMode,
      externalCtaLabel: parsed.externalCtaLabel ?? null,
      externalCtaUrl: parsed.externalCtaUrl ?? null,
      dynamicFormSchema: parsed.dynamicFormSchema
        ? (parsed.dynamicFormSchema as Prisma.InputJsonValue)
        : undefined,
      status: nextStatus,
      isHighlightedOnHome: shouldHighlightOnHome,
      createdBy: { connect: { id: createdById } },
    };

    const program = shouldHighlightOnHome
      ? await this.prisma.$transaction(async (tx) => {
          await tx.program.updateMany({
            where: { isHighlightedOnHome: true },
            data: { isHighlightedOnHome: false },
          });

          return tx.program.create({
            data: createData,
            include: {
              _count: { select: { registrations: { where: { status: 'confirmed' } } } },
            },
          });
        })
      : await this.prisma.program.create({
          data: createData,
          include: {
            _count: { select: { registrations: { where: { status: 'confirmed' } } } },
          },
        });

    return this.mapProgramToDetail(program);
  }

  async listPrograms(query: AdminProgramListRequestLocal) {
    const parsed = AdminProgramListRequestSchemaLocal.parse(query);
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
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

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
          status: true,
          isHighlightedOnHome: true,
          startDate: true,
          totalSlots: true,
          createdAt: true,
          registrationMode: true,
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
        status: program.status,
        startDate: program.startDate.toISOString(),
        totalSlots: program.totalSlots,
        registeredCount: program._count.registrations,
        createdAt: program.createdAt.toISOString(),
        registrationMode: program.registrationMode,
        isHighlightedOnHome: program.isHighlightedOnHome,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProgramById(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        _count: { select: { registrations: { where: { status: 'confirmed' } } } },
      },
    });

    if (!program) throw new NotFoundException('Programa não encontrado');
    return this.mapProgramToDetail(program);
  }

  async updateProgram(id: string, input: UpdateProgramInputLocal) {
    const parsed = UpdateProgramInputSchemaLocal.parse(input);

    const existing = await this.prisma.program.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        registrationMode: true,
        isHighlightedOnHome: true,
        dynamicFormSchema: true,
        _count: { select: { registrations: { where: { status: 'confirmed' } } } },
      },
    });
    if (!existing) throw new NotFoundException('Programa não encontrado');

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

    const nextStatus = parsed.status ?? existing.status;
    const nextHighlight = parsed.isHighlightedOnHome ?? existing.isHighlightedOnHome;
    if (parsed.isHighlightedOnHome === true) {
      this.ensureHomeHighlightCompatibility(nextStatus, true);
    }

    const data: Record<string, unknown> = { ...parsed };
    if (parsed.startDate) data.startDate = new Date(parsed.startDate);
    if (parsed.endDate) data.endDate = new Date(parsed.endDate);
    if (nextStatus !== 'published') {
      data.isHighlightedOnHome = false;
    }
    if (parsed.description !== undefined) {
      const sanitizedDescription = sanitizeRichTextHtml(parsed.description);
      if (extractPlainTextFromHtml(sanitizedDescription).length === 0) {
        throw new UnprocessableEntityException('Descrição pública inválida');
      }
      data.description = sanitizedDescription;
    }

    const shouldHighlightOnHome = nextStatus === 'published' && nextHighlight;

    const program = shouldHighlightOnHome
      ? await this.prisma.$transaction(async (tx) => {
          await tx.program.updateMany({
            where: { id: { not: id }, isHighlightedOnHome: true },
            data: { isHighlightedOnHome: false },
          });

          return tx.program.update({
            where: { id },
            data: {
              ...data,
              isHighlightedOnHome: true,
            },
            include: {
              _count: { select: { registrations: { where: { status: 'confirmed' } } } },
            },
          });
        })
      : await this.prisma.program.update({
          where: { id },
          data,
          include: {
            _count: { select: { registrations: { where: { status: 'confirmed' } } } },
          },
        });

    return this.mapProgramToDetail(program);
  }

  private mapProgramToDetail(program: ProgramWithDetails) {
    const confirmedRegistrations = program._count.registrations;

    return {
      id: program.id,
      title: program.title,
      slug: program.slug,
      category: program.category,
      description: program.description,
      startDate: program.startDate.toISOString(),
      endDate: program.endDate.toISOString(),
      bannerUrl: program.bannerUrl ?? null,
      bannerAltText: program.bannerAltText ?? null,
      availableSlots:
        program.totalSlots === null ? null : program.totalSlots - confirmedRegistrations,
      registrationMode: program.registrationMode,
      externalCtaLabel: program.externalCtaLabel ?? null,
      externalCtaUrl: program.externalCtaUrl ?? null,
      totalSlots: program.totalSlots,
      status: program.status,
      isHighlightedOnHome: program.isHighlightedOnHome,
      dynamicFormSchema: this.mapDynamicFormSchema(program.dynamicFormSchema),
      createdAt: program.createdAt.toISOString(),
    };
  }

  private mapDynamicFormSchema(dynamicFormSchema: Prisma.JsonValue | null) {
    if (dynamicFormSchema === null) return null;
    const parsed = DynamicFormSchema.safeParse(dynamicFormSchema);
    return parsed.success ? parsed.data : null;
  }
}
