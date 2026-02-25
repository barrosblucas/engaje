import { HomePage } from '@/components/public/home/home-page';
import { buildHomeStats, getFeaturedEvents } from '@/components/public/home/home-utils';
import type { PublicActiveProgramResponse, PublicEventsResponse } from '@engaje/contracts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engaje | Portal Municipal de Eventos e Iniciativas',
  description:
    'Plataforma oficial da Prefeitura de Bandeirantes - MS para eventos, inscricoes online e programas municipais.',
  openGraph: {
    title: 'Engaje - Bandeirantes Conectada',
    description:
      'Descubra eventos, campanhas e iniciativas municipais com inscricao digital simples.',
  },
};

const API_BASE = process.env.INTERNAL_API_URL ?? 'http://localhost:3001';

async function fetchHomeEvents() {
  try {
    const response = await fetch(`${API_BASE}/v1/public/events?limit=12&sort=date_asc`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch public events: ${response.status}`);
    }

    const payload = (await response.json()) as PublicEventsResponse;

    return {
      events: getFeaturedEvents(payload.data, 6),
      total: payload.meta.total,
    };
  } catch {
    return {
      events: [],
      total: 0,
    };
  }
}

async function fetchActiveProgram() {
  try {
    const response = await fetch(`${API_BASE}/v1/public/programs/active`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active program: ${response.status}`);
    }

    const payload = (await response.json()) as PublicActiveProgramResponse;
    return payload.data;
  } catch {
    return null;
  }
}

export default async function PublicHomePage() {
  const [{ events, total }, activeProgram] = await Promise.all([
    fetchHomeEvents(),
    fetchActiveProgram(),
  ]);
  const stats = buildHomeStats(total);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <HomePage events={events} activeProgram={activeProgram} stats={stats} />
    </div>
  );
}
