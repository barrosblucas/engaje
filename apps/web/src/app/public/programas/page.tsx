import { PublicBadge } from '@/components/public/public-badge';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Programas e Iniciativas',
  description:
    'Acompanhe programas municipais com calendário, requisitos e pontos de atendimento da Prefeitura.',
};

const PROGRAMS = [
  {
    title: 'Caravana da Saúde',
    description:
      'Unidades móveis com consulta básica, triagem e encaminhamento para rede municipal.',
    audience: 'Famílias e idosos',
    frequency: 'Toda semana',
    tone: 'community' as const,
  },
  {
    title: 'Vacinação em Dia',
    description:
      'Campanhas sazonais e calendário anual com polos por bairro e horários estendidos.',
    audience: 'Todas as idades',
    frequency: 'Calendário contínuo',
    tone: 'brand' as const,
  },
  {
    title: 'Feira do Empreendedor',
    description: 'Capacitação, networking e oportunidades para empreendedores locais e MEIs.',
    audience: 'Comerciantes e autônomos',
    frequency: 'Mensal',
    tone: 'accent' as const,
  },
  {
    title: 'Agenda Jovem Esporte',
    description: 'Aulas abertas e torneios de modalidades coletivas e individuais.',
    audience: 'Crianças e adolescentes',
    frequency: 'Semestral',
    tone: 'community' as const,
  },
];

export default function ProgramasPage() {
  return (
    <div className="page-transition mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <PublicBadge tone="brand">Programas municipais</PublicBadge>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
          Iniciativas públicas além da agenda de eventos
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Conheça ações permanentes da Prefeitura para saúde, desenvolvimento social, cultura,
          esporte e empreendedorismo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {PROGRAMS.map((program, index) => (
          <article
            key={program.title}
            className="animate-enter rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                {program.title}
              </h2>
              <PublicBadge tone={program.tone}>{program.frequency}</PublicBadge>
            </div>
            <p className="mt-2 text-sm text-slate-600">{program.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Público-alvo
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{program.audience}</p>
          </article>
        ))}
      </section>

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
