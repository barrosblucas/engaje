import {
  ChangePasswordInputSchema,
  CreateAdminUserInputSchema,
  RegisterInputSchema,
  RequestPasswordResetInputSchema,
  ResetPasswordInputSchema,
  UpdateProfileInputSchema,
} from '@engaje/contracts';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
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
    const sessionUser = await this.authService.registerCitizen(input);
    await this.persistSession(req, sessionUser);

    return {
      user: await this.authService.getUserProfileById(sessionUser.id),
    };
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    await this.persistSession(req, user);

    return {
      user: await this.authService.getUserProfileById(user.id),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: AuthenticatedRequest) {
    this.authService.logout(req as unknown as Express.Request);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    return {
      user: await this.authService.getUserProfileById(user.id),
    };
  }

  @Patch('profile')
  @UseGuards(SessionAuthGuard)
  async updateProfile(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const input = UpdateProfileInputSchema.parse(body);
    return {
      user: await this.authService.updateProfile(user.id, input),
    };
  }

  @Patch('password')
  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const input = ChangePasswordInputSchema.parse(body);
    await this.authService.changePassword(user.id, input);
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() body: unknown) {
    const input = RequestPasswordResetInputSchema.parse(body);
    await this.authService.requestPasswordReset(input);

    return {
      message:
        'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha. O link expira em 2 horas.',
      expiresInHours: this.authService.getPasswordResetExpirationHours(),
    };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() body: unknown) {
    const input = ResetPasswordInputSchema.parse(body);
    await this.authService.resetPassword(input);
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
    // Only super_admin can create admins through legacy endpoint.
    if (req.user?.role !== 'super_admin') {
      throw new UnauthorizedException('Apenas super_admin pode criar administradores');
    }

    const input = CreateAdminUserInputSchema.parse(body);
    const user = await this.authService.createAdminUser(input);

    return {
      user: await this.authService.getUserProfileById(user.id),
    };
  }

  private async persistSession(req: AuthenticatedRequest, user: UserSession): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      req.login(user, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    }).catch(() => {
      throw new InternalServerErrorException('Falha ao iniciar sessão');
    });
  }
}
