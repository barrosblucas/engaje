'use client';

import { Accordion } from '@/components/ui/accordion';
import { Timeline } from '@/components/ui/timeline';
import { HOME_FAQ, HOME_TIMELINE } from './home-data';
import { Reveal } from './reveal';

export function HomeEngagement() {
  return (
    <section className="space-y-6">
      <div className="space-y-6">
        <Reveal>
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_12px_25px_rgba(15,23,42,0.08)] sm:p-6">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              FAQ dos programas
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Dúvidas frequentes para facilitar o acesso da população.
            </p>
            <div className="mt-4">
              <Accordion items={HOME_FAQ} />
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_12px_25px_rgba(15,23,42,0.08)] sm:p-6">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Linha do tempo de acoes
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Planejamento publico com acompanhamento transparente.
            </p>
            <div className="mt-4">
              <Timeline items={HOME_TIMELINE} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
