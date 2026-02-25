'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import type { HomePageStats } from './home-types';
import { Reveal } from './reveal';

interface HomeStatsProps {
  stats: HomePageStats;
}

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

function AnimatedCounter({ value, suffix = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const durationMs = 950;
    const startTime = performance.now();

    const step = (time: number) => {
      const progress = Math.min((time - startTime) / durationMs, 1);
      setDisplayValue(Math.round(value * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}

export function HomeStats({ stats }: HomeStatsProps) {
  const items = useMemo(
    () => [
      { label: 'Eventos realizados', value: stats.eventsCount },
      { label: 'Inscricoes confirmadas', value: stats.registrationsCount },
      { label: 'Programas ativos', value: stats.activeProgramsCount },
    ],
    [stats],
  );

  return (
    <Reveal>
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,var(--color-primary),#163a66)] p-6 text-white shadow-[0_20px_45px_rgba(26,60,110,0.3)] sm:p-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-[clamp(1.3rem,3vw,1.8rem)] font-semibold">Engajamento da cidade</h2>
          <p className="text-xs uppercase tracking-[0.08em] text-blue-100">Dados institucionais</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.label} variant="stat" className="p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-blue-100">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                <AnimatedCounter value={item.value} />
              </p>
            </Card>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
