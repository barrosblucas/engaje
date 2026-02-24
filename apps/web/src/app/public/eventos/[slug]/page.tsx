import { RichTextContent } from '@/components/editor/rich-text-content';
import { AttendanceIntentButton } from '@/components/events/attendance-intent-button';
import { PublicBadge } from '@/components/public/public-badge';
import {
  formatEventDate,
  formatSlots,
  getCategoryColor,
  getCategoryLabel,
} from '@/lib/public-events';
import { stripHtmlForTextPreview } from '@/lib/rich-text';
import type { PublicEventDetailResponse } from '@engaje/contracts';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_BASE = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

async function fetchEvent(slug: string): Promise<PublicEventDetailResponse | null> {
  const response = await fetch(`${API_BASE}/v1/public/events/${slug}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch event: ${response.status}`);

  return response.json() as Promise<PublicEventDetailResponse>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEvent(slug);

  if (!event) {
    return { title: 'Evento não encontrado | Engajé' };
  }

  const ev = event.data;

  return {
    title: `${ev.title} | Engajé`,
    description: ev.description
      ? stripHtmlForTextPreview(ev.description)
      : `Participe do evento ${ev.title}.`,
    openGraph: {
      title: ev.title,
      description: ev.description ? stripHtmlForTextPreview(ev.description) : undefined,
      images: ev.bannerUrl ? [{ url: ev.bannerUrl, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await fetchEvent(slug);

  if (!event) notFound();

  const ev = event.data;
  const isFull = ev.availableSlots !== null && ev.availableSlots <= 0;
  const isOpen = ev.status === 'published';
  const isInformativeMode = ev.registrationMode === 'informative';
  const categoryTone = getCategoryColor(ev.category);
  const registrationPath = `/app/inscricoes/nova/${slug}`;

  return (
    <div className="page-transition pb-24 md:pb-10">
      <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          href="/public/eventos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <span aria-hidden="true">←</span> Voltar para agenda
        </Link>

        <div className="mt-3 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-elevated">
          <div className="relative aspect-[16/8] bg-gradient-to-br from-brand-100 via-cyan-50 to-community-100">
            {ev.bannerUrl ? (
              <Image
                src={ev.bannerUrl}
                alt={ev.bannerAltText ?? ev.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(30,136,229,0.3),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_45%)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <PublicBadge tone={categoryTone}>{getCategoryLabel(ev.category)}</PublicBadge>
                <PublicBadge tone={isFull ? 'danger' : 'success'}>
                  {formatSlots(ev.availableSlots)}
                </PublicBadge>
                <PublicBadge tone={isInformativeMode ? 'accent' : 'brand'}>
                  {isInformativeMode ? 'Informativo' : 'Inscrição'}
                </PublicBadge>
              </div>

              <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {ev.title}
              </h1>
              <p className="mt-2 text-sm text-slate-100 sm:text-base">
                {formatEventDate(ev.startDate, ev.endDate)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.55fr_0.9fr]">
        <article className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Local</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{ev.locationName}</p>
              {ev.locationAddress ? (
                <p className="mt-1 text-sm text-slate-600">{ev.locationAddress}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {isOpen
                  ? isInformativeMode
                    ? 'Evento informativo'
                    : 'Inscrições abertas'
                  : ev.status === 'closed'
                    ? 'Evento encerrado'
                    : 'Indisponível'}
              </p>
              <p className="mt-1 text-sm text-slate-600">{formatSlots(ev.availableSlots)}</p>
            </div>
          </div>

          {ev.description ? (
            <section className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-slate-900">Sobre o evento</h2>
              <RichTextContent html={ev.description} className="text-sm sm:text-base" />
            </section>
          ) : null}

          {ev.images.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">Galeria</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {ev.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <aside id="inscricao" className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <AttendanceIntentButton
            eventId={ev.id}
            initialCount={ev.attendanceIntentCount}
            redirectPath={`/public/eventos/${slug}`}
          />

          <div className="rounded-3xl border border-brand-200/70 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              {isInformativeMode ? 'Informações oficiais' : 'Inscrição'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isInformativeMode
                ? 'Este conteúdo é apenas informativo. Utilize o link oficial para continuar.'
                : 'Preencha o formulário para confirmar sua inscrição.'}
            </p>

            <div className="mt-4">
              {!isOpen ? (
                <div className="rounded-2xl border border-warning-100 bg-warning-100/65 p-4 text-sm font-medium text-warning-700">
                  {ev.status === 'closed'
                    ? 'As inscrições deste evento foram encerradas.'
                    : 'Este evento está indisponível no momento.'}
                </div>
              ) : null}

              {isOpen && !isInformativeMode && isFull ? (
                <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm font-medium text-danger-800">
                  Vagas esgotadas no momento. Acompanhe a agenda para novas turmas.
                </div>
              ) : null}

              {isOpen && !isInformativeMode && !isFull ? (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                    Faça sua inscrição para garantir sua participação. Ao continuar, você poderá
                    preencher os campos obrigatórios e confirmar sua vaga.
                  </p>
                  <Link
                    href={registrationPath}
                    className="action-primary cta-pulse w-full justify-center"
                  >
                    Fazer inscrição
                  </Link>
                </div>
              ) : null}

              {isOpen && isInformativeMode ? (
                ev.externalCtaLabel && ev.externalCtaUrl ? (
                  <a
                    href={ev.externalCtaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="action-primary w-full justify-center"
                  >
                    {ev.externalCtaLabel}
                  </a>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Nenhum link externo configurado para este evento informativo.
                  </div>
                )
              ) : null}
            </div>
          </div>
        </aside>
      </section>

      {isOpen && !isInformativeMode && !isFull ? (
        <div className="fixed inset-x-0 bottom-[4.6rem] z-40 px-4 md:hidden">
          <Link href={registrationPath} className="action-primary cta-pulse w-full justify-center">
            Fazer inscrição
          </Link>
        </div>
      ) : null}

      {isOpen && isInformativeMode && ev.externalCtaLabel && ev.externalCtaUrl ? (
        <div className="fixed inset-x-0 bottom-[4.6rem] z-40 px-4 md:hidden">
          <a
            href={ev.externalCtaUrl}
            target="_blank"
            rel="noreferrer"
            className="action-primary cta-pulse w-full justify-center"
          >
            {ev.externalCtaLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}
