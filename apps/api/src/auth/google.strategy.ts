import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { type Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import type { UserSession } from './auth.types';
import { resolveGoogleOAuthConfig } from './google-auth-config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super(resolveGoogleOAuthConfig(process.env));
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<UserSession> {
    const email = profile.emails?.[0]?.value ?? '';
    const name = profile.displayName ?? '';
    const googleId = profile.id;
    return this.authService.findOrCreateGoogleUser({ email, name, googleId });
  }
}
