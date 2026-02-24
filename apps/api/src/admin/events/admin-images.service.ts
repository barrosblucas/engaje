import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../../prisma/prisma.service';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_IMAGES_PER_EVENT = 10;

@Injectable()
export class AdminImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async saveBanner(file: Express.Multer.File): Promise<string> {
    this.validateImage(file);
    await fs.mkdir(path.join(UPLOADS_DIR, 'banners'), { recursive: true });
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(UPLOADS_DIR, 'banners', filename);

    await sharp(file.buffer)
      .resize(1200, 630, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return `/uploads/banners/${filename}`;
  }

  async addEventImage(
    eventId: string,
    file: Express.Multer.File,
    altText: string,
  ): Promise<{ id: string; imageUrl: string; altText: string; displayOrder: number }> {
    if (!altText?.trim()) {
      throw new BadRequestException('Alt text é obrigatório para imagens (WCAG)');
    }
    this.validateImage(file);

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, _count: { select: { images: true } } },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event._count.images >= MAX_IMAGES_PER_EVENT) {
      throw new UnprocessableEntityException(
        `Máximo de ${MAX_IMAGES_PER_EVENT} imagens por evento`,
      );
    }

    await fs.mkdir(path.join(UPLOADS_DIR, 'events', eventId), { recursive: true });
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(UPLOADS_DIR, 'events', eventId, filename);

    await sharp(file.buffer).webp({ quality: 85 }).toFile(outputPath);

    const maxOrder = await this.prisma.eventImage.aggregate({
      where: { eventId },
      _max: { displayOrder: true },
    });

    const image = await this.prisma.eventImage.create({
      data: {
        eventId,
        imageUrl: `/uploads/events/${eventId}/${filename}`,
        altText: altText.trim(),
        displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      },
    });

    return {
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      displayOrder: image.displayOrder,
    };
  }

  async deleteEventImage(eventId: string, imageId: string): Promise<void> {
    const image = await this.prisma.eventImage.findFirst({
      where: { id: imageId, eventId },
    });
    if (!image) throw new NotFoundException('Imagem não encontrada');

    await this.prisma.eventImage.delete({ where: { id: imageId } });

    const filePath = path.join(UPLOADS_DIR, image.imageUrl.replace('/uploads/', ''));
    await fs.unlink(filePath).catch(() => undefined); // file may not exist
  }

  private validateImage(file: Express.Multer.File): void {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Formato inválido. Use JPG, PNG ou WebP');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('Imagem maior que 2MB');
    }
  }
}
