import { PublicFooter } from '@/components/public/public-footer';
import { PublicHeader } from '@/components/public/public-header';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-layout relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(26,60,110,0.12),transparent_30%),radial-gradient(circle_at_86%_2%,rgba(45,125,79,0.14),transparent_28%),linear-gradient(180deg,var(--color-bg)_0%,color-mix(in_srgb,var(--color-bg)_85%,white)_55%,var(--color-bg)_100%)]" />
      <PublicHeader />
      <main id="conteudo-principal" className="relative flex-1 pb-28 md:pb-12">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
