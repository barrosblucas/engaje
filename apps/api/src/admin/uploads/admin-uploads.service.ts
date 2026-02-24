import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

@Injectable()
export class AdminUploadsService {
  async saveContentImage(file: Express.Multer.File): Promise<{
    url: string;
    mimeType: string;
    width?: number;
    height?: number;
  }> {
    this.validateImage(file);
    await fs.mkdir(path.join(UPLOADS_DIR, 'content'), { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const outputPath = path.join(UPLOADS_DIR, 'content', filename);

    const info = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    return {
      url: `/uploads/content/${filename}`,
      mimeType: 'image/webp',
      width: info.width,
      height: info.height,
    };
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
