import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserSession } from '../auth/auth.types';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { CreateRegistrationWithFormDataInputSchema } from '../shared/super-admin.schemas';
import { RegistrationsService } from './registrations.service';

type AuthenticatedRequest = Request & { user: UserSession };

@Controller('registrations')
@UseGuards(SessionAuthGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const { eventId, formData } = CreateRegistrationWithFormDataInputSchema.parse(body);
    return this.registrationsService.createRegistration(req.user.id, eventId, formData);
  }

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query('page') page = '1', @Query('limit') limit = '10') {
    return this.registrationsService.getUserRegistrations(
      req.user.id,
      Number.parseInt(page, 10),
      Number.parseInt(limit, 10),
    );
  }

  @Get(':id')
  detail(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.registrationsService.getUserRegistrationById(req.user.id, id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.registrationsService.cancelRegistration(id, req.user.id);
  }
}
