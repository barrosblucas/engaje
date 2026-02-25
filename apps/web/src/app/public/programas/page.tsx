import { PublicBadge } from '@/components/public/public-badge';
import {
  formatEventDate,
  formatSlots,
  getCategoryColor,
  getCategoryLabel,
  shouldShowSlotsForMode,
} from '@/lib/public-events';
import type { EventCategory, PublicProgramsResponse } from '@engaje/contracts';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Programas e Iniciativas',
  description:
    'Acompanhe programas municipais com calendário, requisitos e pontos de atendimento da Prefeitura.',
};

const API_BASE = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

const CATEGORY_OPTIONS: EventCategory[] = [
  'cultura',
  'esporte',
  'saude',
  'educacao',
  'civico',
  'festa',
];

interface PublicProgramsQuery {
  page?: string;
  search?: string;
  category?: string;
  sort?: string;
}

async function fetchPublicPrograms(params: PublicProgramsQuery): Promise<PublicProgramsResponse> {
  const queryString = new URLSearchParams();

  if (params.page) queryString.set('page', params.page);
  if (params.search) queryString.set('search', params.search);
  if (params.category) queryString.set('category', params.category);
  if (params.sort) queryString.set('sort', params.sort);

  const endpoint = queryString.toString()
    ? `${API_BASE}/v1/public/programs?${queryString.toString()}`
    : `${API_BASE}/v1/public/programs`;

  const response = await fetch(endpoint, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch programs: ${response.status}`);
  }

  return response.json() as Promise<PublicProgramsResponse>;
}

interface PageProps {
  searchParams: Promise<PublicProgramsQuery>;
}

export default async function ProgramasPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let data: PublicProgramsResponse | null = null;
  let error: string | null = null;

  try {
    data = await fetchPublicPrograms(params);
  } catch {
    error = 'Não foi possível carregar os programas agora. Tente novamente em alguns instantes.';
  }

  return (
    <div className="page-transition mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <PublicBadge tone="brand">Programas municipais</PublicBadge>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
          Iniciativas públicas além da agenda de eventos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Explore programas ativos com detalhes de participação, período e orientações oficiais.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-soft sm:p-5">
        <form method="GET" className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
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
              placeholder="Digite programa, tema ou palavra-chave"
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

          <button type="submit" className="action-primary h-[46px] w-full justify-center md:w-auto">
            Aplicar filtros
          </button>
        </form>
      </section>

      {error ? (
        <section className="rounded-3xl border border-danger-200 bg-danger-50 px-5 py-4 text-danger-800 shadow-soft">
          <p className="font-semibold">{error}</p>
        </section>
      ) : null}

      {data && data.data.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <p className="font-display text-2xl font-semibold text-slate-900">
            Nenhum programa encontrado
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Tente remover filtros ou buscar por outra palavra-chave.
          </p>
          <Link href="/public/programas" className="action-secondary mt-5">
            Limpar filtros
          </Link>
        </section>
      ) : null}

      {data && data.data.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {data.data.map((program, index) => (
            <article
              key={program.id}
              className="animate-enter overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft"
              style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-100 via-cyan-50 to-community-100">
                {program.bannerUrl ? (
                  <Image
                    src={program.bannerUrl}
                    alt={program.bannerAltText ?? program.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : null}

                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  <PublicBadge tone={getCategoryColor(program.category)}>
                    {getCategoryLabel(program.category)}
                  </PublicBadge>
                  <PublicBadge
                    tone={program.registrationMode === 'informative' ? 'accent' : 'brand'}
                  >
                    {program.registrationMode === 'informative' ? 'Informativo' : 'Inscrição'}
                  </PublicBadge>
                </div>
              </div>

              <div className="space-y-3 p-5">
                <h2 className="line-clamp-2 font-display text-2xl font-semibold text-slate-900">
                  {program.title}
                </h2>

                <p className="text-sm font-medium text-slate-600">
                  {formatEventDate(program.startDate, program.endDate)}
                </p>

                {shouldShowSlotsForMode(program.registrationMode) ? (
                  <p className="text-sm font-semibold text-slate-700">
                    {formatSlots(program.availableSlots)}
                  </p>
                ) : null}

                <Link
                  href={`/public/programas/${program.slug}`}
                  className="action-secondary text-sm"
                >
                  Ver detalhes
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="rounded-3xl border border-brand-200 bg-brand-50/60 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-brand-900">
          Quer participar de um evento?
        </h2>
        <p className="mt-2 text-sm text-brand-800">
          A agenda pública é atualizada em tempo real com vagas, datas e locais oficiais.
        </p>
        <Link href="/public/eventos" className="action-primary mt-4 text-sm">
          Ir para agenda de eventos
        </Link>
      </section>
    </div>
  );
}
