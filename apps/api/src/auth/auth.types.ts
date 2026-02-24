import type { UserRole } from '@engaje/contracts';

/** Dados do usuário armazenados na sessão. */
export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cpf: string | null;
}
