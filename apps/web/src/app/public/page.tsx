import { HomePage } from '@/components/public/home/home-page';
import type { HomePageStats } from '@/components/public/home/home-types';
import { getFeaturedEvents } from '@/components/public/home/home-utils';
import { resolvePublicApiBase } from '@/lib/public-api-base';
import type {
  PublicActiveProgramResponse,
  PublicEventsResponse,
  PublicPlatformStatsResponse,
} from '@engaje/contracts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engaje | Portal Municipal de Eventos e Iniciativas',
  description:
    'Plataforma oficial da Prefeitura de Bandeirantes - MS para eventos, inscrições online e programas municipais.',
  openGraph: {
    title: 'Engaje - Bandeirantes Conectada',
    description:
      'Descubra eventos, campanhas e iniciativas municipais com inscrição digital simples.',
  },
};

const API_BASE = resolvePublicApiBase();
const FALLBACK_PLATFORM_STATS: HomePageStats = {
  eventsCount: 0,
  registrationsCount: 0,
  activeProgramsCount: 0,
};

async function fetchHomeEvents() {
  try {
    const response = await fetch(`${API_BASE}/v1/public/events?limit=12&sort=date_asc`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch public events: ${response.status}`);
    }

    const payload = (await response.json()) as PublicEventsResponse;
    return getFeaturedEvents(payload.data, 6);
  } catch {
    return [];
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

async function fetchPlatformStats(): Promise<HomePageStats> {
  try {
    const response = await fetch(`${API_BASE}/v1/public/platform-stats`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch public platform stats: ${response.status}`);
    }

    const payload = (await response.json()) as PublicPlatformStatsResponse;
    return payload.data;
  } catch {
    return FALLBACK_PLATFORM_STATS;
  }
}

export default async function PublicHomePage() {
  const [events, activeProgram, stats] = await Promise.all([
    fetchHomeEvents(),
    fetchActiveProgram(),
    fetchPlatformStats(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <HomePage events={events} activeProgram={activeProgram} stats={stats} />
    </div>
  );
}
