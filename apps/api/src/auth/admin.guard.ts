import { type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { UserSession } from './auth.types';
import { SessionAuthGuard } from './session-auth.guard';

@Injectable()
export class AdminGuard extends SessionAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const isAuthenticated = super.canActivate(context);
    if (!isAuthenticated) return false;

    const request = context.switchToHttp().getRequest<Express.Request & { user?: UserSession }>();
    const user = request.user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return true;
  }
}
