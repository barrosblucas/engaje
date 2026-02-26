import { createHash, randomBytes } from 'node:crypto';
import {
  type ChangePasswordInput,
  ChangePasswordInputSchema,
  type CreateAdminUserInput,
  CreateAdminUserInputSchema,
  type RegisterInput,
  RegisterInputSchema,
  type RequestPasswordResetInput,
  RequestPasswordResetInputSchema,
  type ResetPasswordInput,
  ResetPasswordInputSchema,
  type UpdateProfileInput,
  UpdateProfileInputSchema,
  type User,
} from '@engaje/contracts';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { addHours } from 'date-fns';
import { getPrimaryAppOrigin } from '../config/app-origins';
import { PrismaService } from '../prisma/prisma.service';
import { validateCpf } from '../shared/cpf.util';
import { AuthMailService } from './auth-mail.service';
import type { UserSession } from './auth.types';

const PASSWORD_HASH_ROUNDS = 12;
const PASSWORD_RESET_EXPIRATION_HOURS = 2;

type SessionUserRecord = {
  id: string;
  email: string;
  name: string;
  role: UserSession['role'];
  cpf: string | null;
  phone: string | null;
};

type UserProfileRecord = SessionUserRecord & { createdAt: Date };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authMailService: AuthMailService,
  ) {}

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
        phone: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return this.mapSessionUser(user);
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

    const passwordHash = await bcrypt.hash(parsed.password, PASSWORD_HASH_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: parsed.name,
        cpf: parsed.cpf,
        email: parsed.email,
        phone: this.normalizePhone(parsed.phone),
        passwordHash,
        role: 'citizen',
      },
      select: { id: true, email: true, name: true, role: true, cpf: true, phone: true },
    });

    return this.mapSessionUser(user);
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cpf: true,
        phone: true,
        googleId: true,
      },
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
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          cpf: true,
          phone: true,
          googleId: true,
        },
      });
    }

    return this.mapSessionUser(user);
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

    const passwordHash = await bcrypt.hash(parsed.password, PASSWORD_HASH_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash,
        role: parsed.role,
      },
      select: { id: true, email: true, name: true, role: true, cpf: true, phone: true },
    });

    return this.mapSessionUser(user);
  }

  /** Retorna usuário pelo ID (para resposta e reconstituição de sessão). */
  async findUserById(id: string): Promise<UserSession | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, cpf: true, phone: true },
    });
    if (!user) return null;
    return this.mapSessionUser(user);
  }

  /** Retorna perfil completo do usuário autenticado. */
  async getUserProfileById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new UnauthorizedException('Sessão inválida');
    }

    return this.mapUserProfile(user);
  }

  /** Atualiza dados cadastrais (sem permitir alteração de CPF). */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const parsed = UpdateProfileInputSchema.parse(input);
    const nextEmail = parsed.email.trim();

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: nextEmail },
      select: { id: true },
    });

    if (existingByEmail && existingByEmail.id !== userId) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.name.trim(),
        email: nextEmail,
        phone: this.normalizePhone(parsed.phone),
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

    return this.mapUserProfile(user);
  }

  /** Troca senha exigindo senha atual. */
  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const parsed = ChangePasswordInputSchema.parse(input);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Usuário sem senha local cadastrada');
    }

    const isCurrentPasswordValid = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual inválida');
    }

    const nextPasswordHash = await bcrypt.hash(parsed.newPassword, PASSWORD_HASH_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: nextPasswordHash },
    });
  }

  /** Gera token e envia e-mail de recuperação sem revelar existência da conta. */
  async requestPasswordReset(input: RequestPasswordResetInput): Promise<void> {
    const parsed = RequestPasswordResetInputSchema.parse(input);

    const user = await this.prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) return;

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = addHours(new Date(), PASSWORD_RESET_EXPIRATION_HOURS);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const appOrigin = getPrimaryAppOrigin(process.env);
    const resetLink = `${appOrigin}/redefinir-senha?token=${encodeURIComponent(rawToken)}`;

    try {
      await this.authMailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetLink,
        expiresInHours: PASSWORD_RESET_EXPIRATION_HOURS,
      });
    } catch {
      this.logger.warn('Falha ao enviar e-mail de recuperação de senha');
    }
  }

  /** Redefine senha a partir de token válido e expira tokens pendentes do usuário. */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const parsed = ResetPasswordInputSchema.parse(input);
    const tokenHash = this.hashResetToken(parsed.token);
    const now = new Date();
    const usedAt = new Date();

    const token = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });

    if (!token) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(parsed.newPassword, PASSWORD_HASH_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      const consumedToken = await tx.passwordResetToken.updateMany({
        where: {
          id: token.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt },
      });

      if (consumedToken.count !== 1) {
        throw new BadRequestException('Token inválido ou expirado');
      }

      await tx.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          userId: token.userId,
          usedAt: null,
        },
        data: { usedAt },
      });
    });
  }

  getPasswordResetExpirationHours(): number {
    return PASSWORD_RESET_EXPIRATION_HOURS;
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

  private hashResetToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private mapSessionUser(user: SessionUserRecord): UserSession {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cpf: user.cpf,
      phone: user.phone,
    };
  }

  private mapUserProfile(user: UserProfileRecord): User {
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

  private normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits.length > 0 ? digits : null;
  }
}
