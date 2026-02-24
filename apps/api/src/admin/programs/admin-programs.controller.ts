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
import { AdminGuard } from '../../auth/admin.guard';
import type { UserSession } from '../../auth/auth.types';
import {
  AdminProgramListRequestSchemaLocal,
  CreateProgramInputSchemaLocal,
  UpdateProgramInputSchemaLocal,
} from '../../shared/super-admin.schemas';
import { AdminProgramsService } from './admin-programs.service';

type AuthenticatedRequest = Request & { user: UserSession };

@Controller('admin/programs')
@UseGuards(AdminGuard)
export class AdminProgramsController {
  constructor(private readonly adminProgramsService: AdminProgramsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProgram(@Body() body: Record<string, unknown>, @Req() req: AuthenticatedRequest) {
    const input = CreateProgramInputSchemaLocal.parse(body);
    return this.adminProgramsService.createProgram(input, req.user.id);
  }

  @Get()
  listPrograms(@Query() query: Record<string, string>) {
    const parsed = AdminProgramListRequestSchemaLocal.parse(query);
    return this.adminProgramsService.listPrograms(parsed);
  }

  @Get(':id')
  getProgram(@Param('id') id: string) {
    return this.adminProgramsService.getProgramById(id);
  }

  @Patch(':id')
  updateProgram(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const input = UpdateProgramInputSchemaLocal.parse(body);
    return this.adminProgramsService.updateProgram(id, input);
  }
}
