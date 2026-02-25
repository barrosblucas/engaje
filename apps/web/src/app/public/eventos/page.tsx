import { EventCard } from '@/components/public/event-card';
import { PublicBadge } from '@/components/public/public-badge';
import { resolvePublicApiBase } from '@/lib/public-api-base';
import { getCategoryLabel } from '@/lib/public-events';
import type { EventCategory, PublicEventsResponse } from '@engaje/contracts';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agenda Municipal de Eventos',
  description:
    'Encontre eventos públicos, ações de saúde, esporte, cultura e cidadania com filtros simples e inscrição digital.',
  openGraph: {
    title: 'Agenda Municipal de Eventos | Engajé',
    description:
      'Portal oficial para acompanhar eventos públicos da Prefeitura e confirmar presença em poucos cliques.',
  },
};

const API_BASE = resolvePublicApiBase();

const CATEGORY_OPTIONS: EventCategory[] = [
  'cultura',
  'esporte',
  'saude',
  'educacao',
  'civico',
  'festa',
];

interface PublicEventsQuery {
  page?: string;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

async function fetchPublicEvents(params: PublicEventsQuery): Promise<PublicEventsResponse> {
  const qs = new URLSearchParams();

  if (params.page) qs.set('page', params.page);
  if (params.search) qs.set('search', params.search);
  if (params.category) qs.set('category', params.category);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.sort) qs.set('sort', params.sort);

  const endpoint = qs.toString()
    ? `${API_BASE}/v1/public/events?${qs.toString()}`
    : `${API_BASE}/v1/public/events`;

  const res = await fetch(endpoint, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }

  return res.json() as Promise<PublicEventsResponse>;
}

function createPageHref(params: PublicEventsQuery, page: number) {
  const nextParams = new URLSearchParams();

  if (params.search) nextParams.set('search', params.search);
  if (params.category) nextParams.set('category', params.category);
  if (params.startDate) nextParams.set('startDate', params.startDate);
  if (params.endDate) nextParams.set('endDate', params.endDate);
  if (params.sort) nextParams.set('sort', params.sort);

  nextParams.set('page', String(page));

  return `/public/eventos?${nextParams.toString()}`;
}

interface PageProps {
  searchParams: Promise<PublicEventsQuery>;
}

export default async function EventosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let data: PublicEventsResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchPublicEvents(params);
  } catch {
    error = 'Não foi possível carregar os eventos agora. Tente novamente em alguns instantes.';
  }

  const currentPage = Number(params.page ?? '1');

  return (
    <div className="page-transition pb-8">
      <section className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-brand-200/60 bg-[linear-gradient(135deg,#1e3a8a_0%,#1e88e5_46%,#10b981_115%)] p-6 text-white shadow-elevated sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent-200/35 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-4">
              <PublicBadge tone="accent">Agenda Oficial do Município</PublicBadge>
              <h1 className="max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Eventos públicos para aproximar cidadãos e prefeitura
              </h1>
              <p className="max-w-xl text-sm text-blue-50 sm:text-base">
                Descubra atividades de saúde, esporte, cultura e cidadania em um fluxo simples,
                acessível e mobile-first.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-100">
                  Eventos
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold">
                  {data?.meta.total ?? '—'}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-100">
                  Categorias
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold">6</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="busca-eventos" className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft sm:p-5">
          <form
            method="GET"
            className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-end"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="search"
                className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Buscar
              </label>
              <input
                id="search"
                type="search"
                name="search"
                defaultValue={params.search ?? ''}
                placeholder="Digite evento, bairro ou palavra-chave"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Categoria
              </label>
              <select id="category" name="category" defaultValue={params.category ?? ''}>
                <option value="">Todas</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="startDate"
                className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Data inicial
              </label>
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={params.startDate ?? ''}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="sort"
                className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
              >
                Ordenação
              </label>
              <select id="sort" name="sort" defaultValue={params.sort ?? 'date_asc'}>
                <option value="date_asc">Mais próximos</option>
                <option value="date_desc">Mais distantes</option>
              </select>
            </div>

            <button
              type="submit"
              className="action-primary h-[46px] w-full justify-center md:w-auto"
            >
              Aplicar filtros
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <PublicBadge tone="neutral">Atalhos:</PublicBadge>
            {CATEGORY_OPTIONS.map((category) => (
              <Link
                key={category}
                href={`/public/eventos?category=${category}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                {getCategoryLabel(category)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
        {error ? (
          <div className="rounded-3xl border border-danger-200 bg-danger-50 px-5 py-4 text-danger-800 shadow-soft">
            <p className="font-semibold">{error}</p>
          </div>
        ) : null}

        {data && data.data.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
            <p className="font-display text-2xl font-semibold text-slate-900">
              Nenhum evento encontrado
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Tente remover filtros ou buscar por outra palavra-chave.
            </p>
            <Link href="/public/eventos" className="action-secondary mt-5">
              Limpar filtros
            </Link>
          </div>
        ) : null}

        {data && data.data.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.data.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-enter"
                  style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
                >
                  <EventCard event={event} priority={index < 3} />
                </div>
              ))}
            </div>

            {data.meta.totalPages > 1 ? (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
                aria-label="Paginação de eventos"
              >
                {currentPage > 1 ? (
                  <Link
                    href={createPageHref(params, currentPage - 1)}
                    className="action-secondary text-sm"
                  >
                    ← Página anterior
                  </Link>
                ) : null}
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Página {currentPage} de {data.meta.totalPages}
                </span>
                {currentPage < data.meta.totalPages ? (
                  <Link
                    href={createPageHref(params, currentPage + 1)}
                    className="action-secondary text-sm"
                  >
                    Próxima página →
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="mx-auto mt-10 w-full max-w-6xl px-4 pb-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-700">
                Iniciativas em destaque
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">
                Programas contínuos da cidade
              </h2>
            </div>
            <Link href="/public/programas" className="action-secondary text-sm">
              Ver programas
            </Link>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-community-200 bg-community-50/70 p-4">
              <p className="font-semibold text-community-800">Caravana da Saúde</p>
              <p className="mt-1 text-sm text-community-800/90">
                Atendimento itinerante com orientação, triagem e prevenção.
              </p>
            </article>
            <article className="rounded-2xl border border-accent-200 bg-accent-50/75 p-4">
              <p className="font-semibold text-accent-800">Feira do Empreendedor</p>
              <p className="mt-1 text-sm text-accent-800/90">
                Capacitação e rede de apoio para pequenos negócios locais.
              </p>
            </article>
            <article className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
              <p className="font-semibold text-brand-800">Agenda Jovem Esporte</p>
              <p className="mt-1 text-sm text-brand-800/90">
                Modalidades e campeonatos com inscrição gratuita e inclusiva.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
