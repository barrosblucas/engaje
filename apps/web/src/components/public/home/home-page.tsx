'use client';

import { ToastProvider, useToast } from '@/components/ui/toast';
import type { EventSummary } from '@engaje/contracts';
import { useState } from 'react';
import { HomeCategories } from './home-categories';
import { HomeEngagement } from './home-engagement';
import { HomeFeaturedEvents } from './home-featured-events';
import { HomeHero } from './home-hero';
import { HomeHighlightBanner } from './home-highlight-banner';
import { HomeNews } from './home-news';
import { HomeStats } from './home-stats';
import type { HomePageStats } from './home-types';
import { countEventsThisWeek } from './home-utils';

interface HomePageProps {
  events: EventSummary[];
  stats: HomePageStats;
}

function HomePageContent({ events, stats }: HomePageProps) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const eventsThisWeek = countEventsThisWeek(events);

  const handleQuickApply = (eventTitle: string) => {
    showToast({
      tone: 'success',
      title: 'Inscricao iniciada',
      description: `${eventTitle}: revise os dados e confirme sua vaga.`,
    });
  };

  return (
    <div className="space-y-10 pb-8 pt-5 sm:space-y-12 sm:pt-7">
      {/* Hero institucional com busca e CTAs */}
      <HomeHero eventsThisWeek={eventsThisWeek} />

      {/* Categorias principais */}
      <HomeCategories />

      {/* Cards de eventos com progresso de vagas */}
      <HomeFeaturedEvents events={events} onQuickApply={handleQuickApply} />

      {/* Banner secundario de campanha */}
      <HomeHighlightBanner onOpenModal={() => setModalOpen(true)} />

      {/* Bloco de indicadores com contadores animados */}
      <HomeStats stats={stats} />

      {/* Noticias recentes */}
      <HomeNews />

      {/* Preview do sistema de componentes e fluxos */}
      <HomeEngagement modalOpen={modalOpen} onCloseModal={() => setModalOpen(false)} />
    </div>
  );
}

export function HomePage(props: HomePageProps) {
  return (
    <ToastProvider>
      <HomePageContent {...props} />
    </ToastProvider>
  );
}
