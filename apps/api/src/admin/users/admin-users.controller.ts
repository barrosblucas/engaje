import { CreateManagedUserInputSchema } from '@engaje/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from '../../auth/admin.guard';
import type { UserSession } from '../../auth/auth.types';
import { AdminUsersService } from './admin-users.service';

type AuthenticatedRequest = Request & { user: UserSession };

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const parsedInput = CreateManagedUserInputSchema.safeParse(body);
    if (!parsedInput.success) {
      throw new BadRequestException(parsedInput.error.issues[0]?.message ?? 'Payload inválido');
    }

    const input = parsedInput.data;
    const user = await this.adminUsersService.createManagedUser(req.user, input);

    return {
      user,
    };
  }
}
