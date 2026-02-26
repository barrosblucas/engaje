import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

type PasswordResetEmailPayload = {
  to: string;
  name: string;
  resetLink: string;
  expiresInHours: number;
};

@Injectable()
export class AuthMailService {
  private readonly logger = new Logger(AuthMailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string | null;

  constructor() {
    this.fromAddress = process.env.SMTP_FROM?.trim() || null;

    const host = process.env.SMTP_HOST?.trim();
    const portRaw = process.env.SMTP_PORT?.trim();

    if (!host || !portRaw || !this.fromAddress) {
      this.transporter = null;
      return;
    }

    const port = Number(portRaw);
    if (Number.isNaN(port) || port <= 0) {
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  async sendPasswordResetEmail(payload: PasswordResetEmailPayload): Promise<void> {
    if (!this.transporter || !this.fromAddress) {
      this.logger.warn('SMTP não configurado; envio de recuperação de senha ignorado.');
      return;
    }

    const greetingName = payload.name.trim() || 'usuário';
    const subject = 'Recuperação de senha - Engaje';
    const text = [
      `Olá, ${greetingName}.`,
      '',
      'Recebemos uma solicitação para redefinir sua senha no Engaje.',
      `Use este link para criar uma nova senha: ${payload.resetLink}`,
      '',
      `Este link expira em ${payload.expiresInHours} horas.`,
      'Se você não solicitou a troca de senha, ignore esta mensagem.',
    ].join('\n');

    const html = [
      `<p>Olá, <strong>${this.escapeHtml(greetingName)}</strong>.</p>`,
      '<p>Recebemos uma solicitação para redefinir sua senha no Engaje.</p>',
      `<p><a href="${this.escapeHtml(payload.resetLink)}">Clique aqui para criar uma nova senha</a></p>`,
      `<p>Este link expira em <strong>${payload.expiresInHours} horas</strong>.</p>`,
      '<p>Se você não solicitou a troca de senha, ignore esta mensagem.</p>',
    ].join('');

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: payload.to,
      subject,
      text,
      html,
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
