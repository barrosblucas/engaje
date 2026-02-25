'use client';

import type { EventSummary, ProgramDetail } from '@engaje/contracts';
import { HomeCategories } from './home-categories';
import { HomeEngagement } from './home-engagement';
import { HomeFeaturedEvents } from './home-featured-events';
import { HomeHero } from './home-hero';
import { HomeHighlightBanner } from './home-highlight-banner';
import { HomeStats } from './home-stats';
import type { HomePageStats } from './home-types';
import { countEventsThisWeek } from './home-utils';

interface HomePageProps {
  events: EventSummary[];
  activeProgram: ProgramDetail | null;
  stats: HomePageStats;
}

function HomePageContent({ events, activeProgram, stats }: HomePageProps) {
  const eventsThisWeek = countEventsThisWeek(events);

  return (
    <div className="space-y-10 pb-8 pt-5 sm:space-y-12 sm:pt-7">
      {/* Hero institucional com busca e CTAs */}
      <HomeHero eventsThisWeek={eventsThisWeek} />

      {/* Categorias principais */}
      <HomeCategories />

      {/* Cards de eventos com progresso de vagas */}
      <HomeFeaturedEvents events={events} />

      {/* Banner secundario de campanha */}
      <HomeHighlightBanner activeProgram={activeProgram} />

      {/* Bloco de indicadores com contadores animados */}
      <HomeStats stats={stats} />

      {/* Preview do sistema de componentes e fluxos */}
      <HomeEngagement />
    </div>
  );
}

export function HomePage(props: HomePageProps) {
  return <HomePageContent {...props} />;
}
