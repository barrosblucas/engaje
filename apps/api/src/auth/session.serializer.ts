import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { UserSession } from './auth.types';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(user: UserSession, done: (err: Error | null, id: string) => void): void {
    done(null, this.authService.serializeUser(user));
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user: UserSession | null) => void,
  ): Promise<void> {
    const user = await this.authService.deserializeUser(id);
    done(null, user);
  }
}
