'use client';

import type { CSSProperties } from 'react';
import { HOME_CATEGORIES } from './home-data';
import { Reveal } from './reveal';

export function HomeCategories() {
  return (
    <section>
      <Reveal>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Categorias em foco
            </p>
            <h2 className="mt-1 text-[clamp(1.35rem,3vw,2rem)] font-semibold text-[var(--color-text-primary)]">
              Escolha como quer participar
            </h2>
          </div>
          <p className="max-w-lg text-sm text-[var(--color-text-secondary)]">
            Saúde, esporte, cultura, empreendedorismo e iniciativas de cidadania em um único portal..
          </p>
        </div>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HOME_CATEGORIES.map((category, index) => {
          const Icon = category.icon;

          return (
            <Reveal key={category.id} delay={Math.min(index * 0.08, 0.4)}>
              <article
                className="group rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]"
                style={{ '--category-color': category.colorToken } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--category-color)]/15 text-[color:var(--category-color)] transition group-hover:scale-110">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
                  {category.label}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {category.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
