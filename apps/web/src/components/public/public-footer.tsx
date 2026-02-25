import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import engajeLogo from '../../../imagens/engaje logo.png';

const QUICK_LINKS = [
  { href: '/public', label: 'Home' },
  { href: '/public/eventos', label: 'Eventos' },
  { href: '/login', label: 'Minhas inscricoes' },
  { href: '/public/programas', label: 'Programas' },
  { href: '/public/contato', label: 'Acessibilidade' },
];

export function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-28 pt-10 md:pb-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1.35fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src={engajeLogo}
              alt="Logo Engaje"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">Engaje</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Prefeitura Municipal de Bandeirantes - MS
              </p>
            </div>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Portal oficial para divulgacao de eventos, programas e iniciativas de engajamento
            civico.
          </p>

          <div className="flex gap-2">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da prefeitura"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-surface)] hover:text-[var(--color-primary)]"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook da prefeitura"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-surface)] hover:text-[var(--color-primary)]"
            >
              <Facebook className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/5567999990000"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp da prefeitura"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-surface)] hover:text-[var(--color-primary)]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <p className="font-semibold text-[var(--color-text-primary)]">Links rapidos</p>
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block transition hover:text-[var(--color-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <p className="font-semibold text-[var(--color-text-primary)]">Contato institucional</p>
          <p>Ouvidoria: 0800 000 000</p>
          <p>WhatsApp: (67) 99999-0000</p>
          <p>E-mail: atendimento@bandeirantes.ms.gov.br</p>
          <p>Praca Central, 100 - Centro</p>
          <p className="text-xs">Seg a Sex, 8h as 17h</p>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-6xl border-t border-[var(--color-border)] px-4 pt-5 text-xs text-[var(--color-text-muted)] sm:px-6">
        <p>
          © {new Date().getFullYear()} Prefeitura Municipal de Bandeirantes/MS. LGPD e Politica de
          Privacidade.
        </p>
      </div>
    </footer>
  );
}
