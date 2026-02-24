import {
  AdminEventListRequestSchema,
  AdminRegistrationsRequestSchema,
  CreateEventInputSchema,
  UpdateEventInputSchema,
} from '@engaje/contracts';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { format } from 'date-fns';
import type { Request, Response } from 'express';
import { AdminGuard } from '../../auth/admin.guard';
import type { UserSession } from '../../auth/auth.types';
import { AdminEventsService } from './admin-events.service';
import { AdminImagesService } from './admin-images.service';

type AuthenticatedRequest = Request & { user: UserSession };

@Controller('admin/events')
@UseGuards(AdminGuard)
export class AdminEventsController {
  constructor(
    private readonly adminEventsService: AdminEventsService,
    private readonly adminImagesService: AdminImagesService,
  ) {}

  @Get()
  listEvents(@Query() query: Record<string, string>) {
    const parsed = AdminEventListRequestSchema.parse(query);
    return this.adminEventsService.listEvents(parsed);
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.adminEventsService.getEventById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('banner'))
  async createEvent(
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() banner?: Express.Multer.File,
  ) {
    const input = CreateEventInputSchema.parse(body);
    let bannerUrl: string | undefined;
    if (banner) {
      bannerUrl = await this.adminImagesService.saveBanner(banner);
    }
    return this.adminEventsService.createEvent(input, req.user.id, bannerUrl);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('banner'))
  async updateEvent(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @UploadedFile() banner?: Express.Multer.File,
  ) {
    const input = UpdateEventInputSchema.parse(body);
    let bannerUrl: string | undefined;
    if (banner) {
      bannerUrl = await this.adminImagesService.saveBanner(banner);
    }
    return this.adminEventsService.updateEvent(id, input, bannerUrl);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: unknown) {
    return this.adminEventsService.updateEventStatus(id, status);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id') id: string,
    @Body('altText') altText: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminImagesService.addEventImage(id, file, altText);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(@Param('id') eventId: string, @Param('imageId') imageId: string) {
    return this.adminImagesService.deleteEventImage(eventId, imageId);
  }

  @Get(':id/registrations')
  listRegistrations(@Param('id') id: string, @Query() query: Record<string, string>) {
    const parsed = AdminRegistrationsRequestSchema.parse(query);
    return this.adminEventsService.listEventRegistrations(id, parsed);
  }

  @Get(':id/registrations/export')
  async exportCsv(
    @Param('id') id: string,
    @Query('status') status: string | undefined,
    @Res() res: Response,
  ) {
    const slug = (await this.adminEventsService.getEventSlug(id)) ?? id;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const csv = await this.adminEventsService.exportRegistrationsCsv(id, status);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=inscritos-${slug}-${dateStr}.csv`);
    res.send(`\uFEFF${csv}`); // BOM for Excel compatibility
  }
}
