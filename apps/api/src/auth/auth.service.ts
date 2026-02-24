import {
  type CreateAdminUserInput,
  CreateAdminUserInputSchema,
  type RegisterInput,
  RegisterInputSchema,
} from '@engaje/contracts';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { validateCpf } from '../shared/cpf.util';
import type { UserSession } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /** Valida CPF + senha ou email + senha e retorna sessão do usuário. */
  async validateLocalCredentials(
    identifier: string,
    password: string,
  ): Promise<UserSession | null> {
    const isCpf = /^\d{11}$/.test(identifier);
    const user = await this.prisma.user.findFirst({
      where: isCpf ? { cpf: identifier } : { email: identifier },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cpf: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cpf: user.cpf,
    };
  }

  /** Registra novo cidadão e retorna sessão. */
  async registerCitizen(input: RegisterInput): Promise<UserSession> {
    const parsed = RegisterInputSchema.parse(input);
    if (!validateCpf(parsed.cpf)) {
      throw new ConflictException('CPF inválido');
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ cpf: parsed.cpf }, { email: parsed.email }] },
      select: { cpf: true, email: true },
    });

    if (existing?.cpf === parsed.cpf) {
      throw new ConflictException('CPF já cadastrado');
    }
    if (existing?.email === parsed.email) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: parsed.name,
        cpf: parsed.cpf,
        email: parsed.email,
        phone: parsed.phone,
        passwordHash,
        role: 'citizen',
      },
      select: { id: true, email: true, name: true, role: true, cpf: true },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role, cpf: user.cpf };
  }

  /** Localiza ou cria usuário via Google OAuth. */
  async findOrCreateGoogleUser(params: {
    email: string;
    name: string;
    googleId: string;
  }): Promise<UserSession> {
    const { email, name, googleId } = params;

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      select: { id: true, email: true, name: true, role: true, cpf: true, googleId: true },
    });

    if (user) {
      if (!user.googleId) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: { email, name, googleId, role: 'citizen' },
        select: { id: true, email: true, name: true, role: true, cpf: true, googleId: true },
      });
    }

    return { id: user.id, email: user.email, name: user.name, role: user.role, cpf: user.cpf };
  }

  /** Cria gestor municipal (admin/super_admin). Exclusivo para super_admin. */
  async createAdminUser(input: CreateAdminUserInput): Promise<UserSession> {
    const parsed = CreateAdminUserInputSchema.parse(input);

    const existing = await this.prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash,
        role: parsed.role,
      },
      select: { id: true, email: true, name: true, role: true, cpf: true },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role, cpf: user.cpf };
  }

  /** Retorna usuário pelo ID (para reconstituição de sessão). */
  async findUserById(id: string): Promise<UserSession | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, cpf: true },
    });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role, cpf: user.cpf };
  }

  /** Serializa usuário para sessão. */
  serializeUser(user: UserSession): string {
    return user.id;
  }

  /** Desserializa sessão buscando usuário pelo ID. */
  async deserializeUser(id: string): Promise<UserSession | null> {
    return this.findUserById(id);
  }

  /** Logout — destrói sessão Express. */
  logout(req: Express.Request): void {
    req.logout?.(() => undefined);
  }
}
