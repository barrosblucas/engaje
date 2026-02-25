import { DynamicFormPreview } from '@/components/dynamic-form/dynamic-form-preview';
import { RichTextContent } from '@/components/editor/rich-text-content';
import { PublicBadge } from '@/components/public/public-badge';
import { PublicShareActions } from '@/components/public/public-share-actions';
import { resolvePublicApiBase } from '@/lib/public-api-base';
import {
  formatEventDate,
  formatSlots,
  getCategoryColor,
  getCategoryLabel,
  shouldShowSlotsForMode,
} from '@/lib/public-events';
import { buildPublicShareUrl } from '@/lib/public-share';
import { stripHtmlForTextPreview } from '@/lib/rich-text';
import type { PublicProgramDetailResponse } from '@engaje/contracts';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_BASE = resolvePublicApiBase();

async function fetchProgram(slug: string): Promise<PublicProgramDetailResponse | null> {
  const response = await fetch(`${API_BASE}/v1/public/programs/${slug}`, {
    next: { revalidate: 60 },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch program: ${response.status}`);

  return response.json() as Promise<PublicProgramDetailResponse>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await fetchProgram(slug);

  if (!program) {
    return { title: 'Programa não encontrado | Engajé' };
  }

  const item = program.data;

  return {
    title: `${item.title} | Engajé`,
    description: item.description
      ? stripHtmlForTextPreview(item.description)
      : `Conheça o programa ${item.title}.`,
    openGraph: {
      title: item.title,
      description: item.description ? stripHtmlForTextPreview(item.description) : undefined,
      images: item.bannerUrl ? [{ url: item.bannerUrl, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const program = await fetchProgram(slug);

  if (!program) notFound();

  const item = program.data;
  const isOpen = item.status === 'published';
  const isInformativeMode = item.registrationMode === 'informative';
  const shouldShowSlots = shouldShowSlotsForMode(item.registrationMode);
  const isFull = item.availableSlots !== null && item.availableSlots <= 0;
  const shareUrl = buildPublicShareUrl(`/public/programas/${slug}`);

  return (
    <div className="page-transition pb-24 md:pb-10">
      <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          href="/public/programas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <span aria-hidden="true">←</span> Voltar para programas
        </Link>

        <div className="mt-3 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-elevated">
          <div className="relative aspect-[16/8] bg-gradient-to-br from-brand-100 via-cyan-50 to-community-100">
            {item.bannerUrl ? (
              <Image
                src={item.bannerUrl}
                alt={item.bannerAltText ?? item.title}
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
                <PublicBadge tone={getCategoryColor(item.category)}>
                  {getCategoryLabel(item.category)}
                </PublicBadge>
                {shouldShowSlots ? (
                  <PublicBadge tone={isFull ? 'danger' : 'success'}>
                    {formatSlots(item.availableSlots)}
                  </PublicBadge>
                ) : null}
                <PublicBadge tone={isInformativeMode ? 'accent' : 'brand'}>
                  {isInformativeMode ? 'Informativo' : 'Inscrição'}
                </PublicBadge>
              </div>

              <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {item.title}
              </h1>
              <p className="mt-2 text-sm text-slate-100 sm:text-base">
                {formatEventDate(item.startDate, item.endDate)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.55fr_0.9fr]">
        <article className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                Período
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatEventDate(item.startDate, item.endDate)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {isOpen
                  ? isInformativeMode
                    ? 'Programa informativo'
                    : 'Inscrições abertas'
                  : item.status === 'closed'
                    ? 'Programa encerrado'
                    : 'Indisponível'}
              </p>
              {shouldShowSlots ? (
                <p className="mt-1 text-sm text-slate-600">{formatSlots(item.availableSlots)}</p>
              ) : null}
            </div>
          </div>

          {item.description ? (
            <section className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Sobre o programa
              </h2>
              <RichTextContent html={item.description} className="text-sm sm:text-base" />
            </section>
          ) : null}

          {item.registrationMode === 'registration' && item.dynamicFormSchema ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Campos de participação
              </h2>
              <DynamicFormPreview
                mode={item.registrationMode}
                schema={item.dynamicFormSchema}
                showSubmitButton={false}
              />
            </section>
          ) : null}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl border border-brand-200/70 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Participação</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isInformativeMode
                ? 'Use o link oficial para acessar mais informações sobre este programa.'
                : 'As inscrições deste programa são abertas pelos eventos vinculados.'}
            </p>

            <div className="mt-4 space-y-3">
              {!isOpen ? (
                <div className="rounded-2xl border border-warning-100 bg-warning-100/65 p-4 text-sm font-medium text-warning-700">
                  {item.status === 'closed'
                    ? 'Este programa está encerrado no momento.'
                    : 'Este programa está indisponível agora.'}
                </div>
              ) : null}

              {isOpen && isInformativeMode ? (
                item.externalCtaLabel && item.externalCtaUrl ? (
                  <a
                    href={item.externalCtaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="action-primary w-full justify-center"
                  >
                    {item.externalCtaLabel}
                  </a>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Nenhum link externo configurado para este programa informativo.
                  </div>
                )
              ) : null}

              {isOpen && !isInformativeMode ? (
                <Link
                  href={`/public/eventos?search=${encodeURIComponent(item.title)}`}
                  className="action-primary w-full justify-center"
                >
                  Ver eventos para inscrição
                </Link>
              ) : null}

              <PublicShareActions
                title={item.title}
                shareUrl={shareUrl}
                ctaText="Compartilhe este programa com a sua rede"
              />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
