import type { UserRole } from '@engaje/contracts';
import { resolveRoleHomeRedirect } from '../../app/login/login-redirect';

export const LOGOUT_REDIRECT_PATH = '/public';

type PublicHeaderAuthUser = { role: UserRole } | null | undefined;

export type PublicHeaderAuthState =
  | { isAuthenticated: false; dashboardHref: null; showEnrollmentButton: true }
  | { isAuthenticated: true; dashboardHref: string; showEnrollmentButton: false };

export function resolvePublicHeaderAuthState(user: PublicHeaderAuthUser): PublicHeaderAuthState {
  if (!user) {
    return { isAuthenticated: false, dashboardHref: null, showEnrollmentButton: true };
  }

  return {
    isAuthenticated: true,
    dashboardHref: resolveRoleHomeRedirect(user.role),
    showEnrollmentButton: false,
  };
}
