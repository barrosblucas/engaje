import {
  formatEventDate,
  formatSlots,
  getCategoryColor,
  getCategoryLabel,
  getRelativeDayLabel,
} from '@/lib/public-events';
import type { EventSummary } from '@engaje/contracts';
import Image from 'next/image';
import Link from 'next/link';
import { PublicBadge } from './public-badge';

interface EventCardProps {
  event: EventSummary;
  priority?: boolean;
}

export function EventCard({ event, priority = false }: EventCardProps) {
  const relativeLabel = getRelativeDayLabel(event.startDate);
  const categoryTone = getCategoryColor(event.category);
  const isFull = event.availableSlots !== null && event.availableSlots <= 0;

  return (
    <Link
      href={`/public/eventos/${event.slug}`}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/75 bg-white shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-100 via-cyan-50 to-community-100">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.bannerAltText ?? event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-end bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.25),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_45%)] p-4">
            <span className="text-sm font-semibold text-brand-700/90">Evento Municipal</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <PublicBadge tone={categoryTone}>{getCategoryLabel(event.category)}</PublicBadge>
          {relativeLabel ? <PublicBadge tone="accent">{relativeLabel}</PublicBadge> : null}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h2 className="line-clamp-2 font-display text-xl font-semibold text-slate-900 dark:text-white">
          {event.title}
        </h2>

        <p className="text-sm font-medium text-slate-600">
          {formatEventDate(event.startDate, event.endDate)}
        </p>

        <div className="space-y-1 text-sm text-slate-600">
          <p>{event.locationName}</p>
          <p
            className={
              isFull ? 'font-semibold text-danger-700' : 'font-semibold text-community-700'
            }
          >
            {formatSlots(event.availableSlots)}
          </p>
        </div>

        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition group-hover:text-brand-800">
          Ver detalhes
          <span aria-hidden="true" className="transition group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
