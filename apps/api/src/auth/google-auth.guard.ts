import { ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isGoogleOAuthEnabled } from './google-auth-config';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    if (!isGoogleOAuthEnabled(process.env)) {
      throw new ServiceUnavailableException('Login com Google indisponível no momento');
    }

    return super.canActivate(context);
  }
}
