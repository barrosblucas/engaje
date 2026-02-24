import { AdminUploadImageResponseSchema } from '@engaje/contracts';
import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../../auth/admin.guard';
import { AdminUploadsService } from './admin-uploads.service';

@Controller('admin/uploads')
@UseGuards(AdminGuard)
export class AdminUploadsController {
  constructor(private readonly adminUploadsService: AdminUploadsService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo de imagem é obrigatório');
    }

    const uploaded = await this.adminUploadsService.saveContentImage(file);
    return AdminUploadImageResponseSchema.parse(uploaded);
  }
}
