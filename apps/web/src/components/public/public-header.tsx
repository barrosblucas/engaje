'use client';

import { ThemeToggle } from '@/components/public/theme-toggle';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CalendarDays, FileText, Home, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const DESKTOP_NAV = [
  { href: '/public', label: 'Inicio' },
  { href: '/public/eventos', label: 'Eventos' },
  { href: '/public/programas', label: 'Programas' },
  { href: '/public/contato', label: 'Contato' },
] as const;

const MOBILE_NAV = [
  { href: '/public', label: 'Home', icon: Home },
  { href: '/public/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/login', label: 'Inscricoes', icon: FileText },
  { href: '/public#noticias', label: 'Noticias', icon: Newspaper },
] as const;

function isActive(pathname: string, href: string) {
  if (href.includes('#')) {
    return pathname === href.replace('#noticias', '');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 6);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (pathname) {
      setMenuOpen(false);
    }
  }, [pathname]);

  return (
    <>
      <a
        href="#conteudo-principal"
        className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--color-primary)]"
      >
        Pular para o conteudo principal
      </a>

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={`sticky top-0 z-50 border-b transition ${
          isScrolled
            ? 'border-[rgba(226,232,240,0.9)] bg-[rgba(248,249,252,0.92)] shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/public" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-sm font-bold text-white">
              EN
            </span>
            <span>
              <span className="block text-lg font-semibold text-[var(--color-text-primary)]">
                Engaje
              </span>
              <span className="block text-xs text-[var(--color-text-secondary)]">
                Prefeitura de Bandeirantes - MS
              </span>
            </span>
            <span className="hidden rounded-xl border border-[var(--color-border)] px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] sm:inline-flex">
              Brasao oficial
            </span>
          </Link>

          <nav aria-label="Navegacao principal" className="hidden items-center gap-1 md:flex">
            {DESKTOP_NAV.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/public/eventos">Inscrever-se</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <span className="relative h-4 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 bg-[var(--color-text-primary)] transition ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 bg-[var(--color-text-primary)] transition ${menuOpen ? 'opacity-0' : 'opacity-100'}`}
                />
                <span
                  className={`absolute left-0 top-[14px] h-0.5 w-5 bg-[var(--color-text-primary)] transition ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                />
              </span>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:hidden">
            <nav aria-label="Menu principal mobile" className="grid gap-2">
              {DESKTOP_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild variant="secondary" fullWidth>
                <Link href="/public/eventos">Ver eventos</Link>
              </Button>
            </nav>
          </div>
        ) : null}
      </motion.header>

      <nav
        aria-label="Navegacao rapida"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-[rgba(248,249,252,0.96)] px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-4 gap-2">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-12 flex-col items-center justify-center rounded-xl text-[0.68rem] font-semibold transition ${
                    active
                      ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-white'
                  }`}
                >
                  <Icon className="mb-0.5 h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
