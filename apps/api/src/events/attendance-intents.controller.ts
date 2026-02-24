import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserSession } from '../auth/auth.types';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { AttendanceIntentsService } from './attendance-intents.service';

type AuthenticatedRequest = Request & { user: UserSession };

@Controller('events')
@UseGuards(SessionAuthGuard)
export class AttendanceIntentsController {
  constructor(private readonly attendanceIntentsService: AttendanceIntentsService) {}

  @Post(':id/attendance-intents')
  @HttpCode(HttpStatus.OK)
  createIntent(@Param('id') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.attendanceIntentsService.createIntent(eventId, req.user.id);
  }

  @Delete(':id/attendance-intents')
  @HttpCode(HttpStatus.OK)
  deleteIntent(@Param('id') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.attendanceIntentsService.deleteIntent(eventId, req.user.id);
  }

  @Get(':id/attendance-intents/me')
  getIntentState(@Param('id') eventId: string, @Req() req: AuthenticatedRequest) {
    return this.attendanceIntentsService.getIntentState(eventId, req.user.id);
  }
}
