import {
  type CreateManagedUserInput,
  CreateManagedUserInputSchema,
  type User,
} from '@engaje/contracts';
import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { UserSession } from '../../auth/auth.types';
import { PrismaService } from '../../prisma/prisma.service';
import { validateCpf } from '../../shared/cpf.util';

const PASSWORD_HASH_ROUNDS = 12;

type CreatedUserRecord = {
  id: string;
  email: string;
  name: string;
  role: UserSession['role'];
  cpf: string | null;
  phone: string | null;
  createdAt: Date;
};

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createManagedUser(actor: UserSession, input: CreateManagedUserInput): Promise<User> {
    const parsed = CreateManagedUserInputSchema.parse(input);

    if (parsed.role === 'admin' && actor.role !== 'super_admin') {
      throw new ForbiddenException('Apenas super_admin pode criar administradores');
    }

    if (parsed.role === 'citizen' && (!parsed.cpf || !validateCpf(parsed.cpf))) {
      throw new ConflictException('CPF inválido');
    }

    const orFilters: Array<{ email: string } | { cpf: string }> = [{ email: parsed.email }];
    if (parsed.cpf) {
      orFilters.push({ cpf: parsed.cpf });
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: orFilters },
      select: { email: true, cpf: true },
    });

    if (existing?.email === parsed.email) {
      throw new ConflictException('E-mail já cadastrado');
    }

    if (parsed.cpf && existing?.cpf === parsed.cpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    const passwordHash = await bcrypt.hash(parsed.password, PASSWORD_HASH_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: parsed.name.trim(),
        email: parsed.email.trim(),
        cpf: parsed.role === 'citizen' ? (parsed.cpf ?? null) : null,
        phone: this.normalizePhone(parsed.phone),
        passwordHash,
        role: parsed.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cpf: true,
        phone: true,
        createdAt: true,
      },
    });

    return this.mapUser(user);
  }

  private mapUser(user: CreatedUserRecord): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cpf: user.cpf,
      phone: user.phone,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private normalizePhone(phone?: string): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits.length > 0 ? digits : null;
  }
}
