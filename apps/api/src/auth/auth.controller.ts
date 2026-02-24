import { CreateAdminUserInputSchema, RegisterInputSchema } from '@engaje/contracts';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { getPrimaryAppOrigin } from '../config/app-origins';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import type { UserSession } from './auth.types';
import { SessionAuthGuard } from './session-auth.guard';

type AuthenticatedRequest = Request & { user?: UserSession };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const input = RegisterInputSchema.parse(body);
    const user = await this.authService.registerCitizen(input);
    req.login(user, () => undefined);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        phone: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  login(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        phone: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: AuthenticatedRequest) {
    this.authService.logout(req as unknown as Express.Request);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        phone: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() _req: AuthenticatedRequest, @Res() res: Response) {
    const appUrl = getPrimaryAppOrigin(process.env);
    res.redirect(`${appUrl}/app/dashboard`);
  }

  @Post('admin/users')
  @UseGuards(AdminGuard)
  async createAdminUser(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    // Only super_admin can create admins
    if (req.user?.role !== 'super_admin') {
      throw new UnauthorizedException('Apenas super_admin pode criar administradores');
    }
    const input = CreateAdminUserInputSchema.parse(body);
    const user = await this.authService.createAdminUser(input);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        phone: null,
        createdAt: new Date().toISOString(),
      },
    };
  }
}
