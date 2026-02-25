import type { EventSummary, ProgramDetail } from '@engaje/contracts';

export interface HomePageStats {
  eventsCount: number;
  registrationsCount: number;
  activeProgramsCount: number;
  partnerCitiesCount: number;
}

export interface HomePageData {
  featuredEvents: EventSummary[];
  activeProgram: ProgramDetail | null;
  stats: HomePageStats;
}
