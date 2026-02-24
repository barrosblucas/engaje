import type { EventSummary } from '@engaje/contracts';

export interface HomePageStats {
  eventsCount: number;
  registrationsCount: number;
  activeProgramsCount: number;
  partnerCitiesCount: number;
}

export interface HomePageData {
  featuredEvents: EventSummary[];
  stats: HomePageStats;
}
