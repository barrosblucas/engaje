'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatEventDate,
  formatSlots,
  getCategoryLabel,
  getRelativeDayLabel,
} from '@/lib/public-events';
import type { EventSummary } from '@engaje/contracts';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { resolveEventEnrollmentHref } from './home-utils';
import { Reveal } from './reveal';

interface HomeFeaturedEventsProps {
  events: EventSummary[];
}

const SKELETON_KEYS = ['skeleton-a', 'skeleton-b', 'skeleton-c'] as const;

function slotsProgress(availableSlots: number | null) {
  if (availableSlots === null) {
    return 100;
  }

  const used = Math.max(0, 100 - availableSlots);
  return Math.min(100, Math.max(8, used));
}

export function HomeFeaturedEvents({ events }: HomeFeaturedEventsProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section>
      <Reveal>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Proximos eventos
            </p>
            <h2 className="mt-1 text-[clamp(1.35rem,3vw,2rem)] font-semibold text-[var(--color-text-primary)]">
              Participe das proximas acoes da cidade
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/public/eventos">Ver agenda completa</Link>
          </Button>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.length === 0
          ? SKELETON_KEYS.map((key) => (
              <Card key={key} variant="event" className="h-full overflow-hidden p-0">
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))
          : events.map((event, index) => {
              const relativeLabel = getRelativeDayLabel(event.startDate);

              return (
                <motion.div
                  key={event.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Card variant="event" className="group h-full overflow-hidden p-0">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-secondary)_110%)]">
                      {event.bannerUrl ? (
                        <Image
                          src={event.bannerUrl}
                          alt={event.bannerAltText ?? event.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : null}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <Badge tone="primary">{getCategoryLabel(event.category)}</Badge>
                        {relativeLabel ? <Badge tone="accent">{relativeLabel}</Badge> : null}
                        {index === 0 ? <Badge tone="warning">Em breve</Badge> : null}
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <h3 className="line-clamp-2 text-lg font-semibold text-[var(--color-text-primary)]">
                        {event.title}
                      </h3>
                      <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                        <p className="inline-flex items-center gap-2">
                          <CalendarClock className="h-4 w-4" aria-hidden="true" />
                          {formatEventDate(event.startDate, event.endDate)}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          {event.locationName}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                          Vagas restantes
                        </p>
                        <ProgressBar value={slotsProgress(event.availableSlots)} color="accent" />
                        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {formatSlots(event.availableSlots)}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button asChild variant="primary" fullWidth>
                          <Link href={resolveEventEnrollmentHref(event.slug)}>Inscrever-se</Link>
                        </Button>
                        <Button asChild variant="ghost" fullWidth>
                          <Link href={`/public/eventos/${event.slug}`}>Detalhes</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}
