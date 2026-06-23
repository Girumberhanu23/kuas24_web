export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  league: string;
  author: string;
  date: string;
  imageGradient: string;
  imageUrl?: string;
  featured: boolean;
}

export interface Fixture {
  leagueId?: string;
  date?: string;
  id: string;
  league: string;
  leagueLogo?: string;
  referee?: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  status: "live" | "finished" | "upcoming";
  minute?: string;
}

export interface LeagueCategory {
  id: string;
  name: string;
  logo?: string;
}

export interface PersonalizationOption {
  id: string;
  name: string;
  logo?: string;
  type: "league" | "club";
}

export interface PersonalizationOptions {
  leagues: PersonalizationOption[];
  clubs: PersonalizationOption[];
}

export interface PersonalizationPreferences {
  preferredLeagues: string[];
  preferredClubs: string[];
}

/* ------------------------------------------------------------------ */
/*  Lineup Types                                                       */
/* ------------------------------------------------------------------ */

export interface TeamColors {
  primary: string;
  number: string;
  border: string;
}

export interface LineupPlayer {
  id: number;
  name: string;
  photo?: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface Coach {
  id: number;
  name: string;
  photo?: string;
}

export interface LineupTeam {
  team: {
    id: number;
    name: string;
    logo?: string;
    colors?: {
      player: TeamColors;
      goalkeeper: TeamColors;
    };
  };
  coach?: Coach;
  formation?: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface LineupsResponse {
  home: LineupTeam;
  away: LineupTeam;
}

export interface FixtureEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface FixtureEventsResponse {
  fixtureId: string;
  results: number;
  events: FixtureEvent[];
}

export interface StandingRow {
  rank: number;
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  points: number;
  goalsDiff: number;
  form?: string;
  description?: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface StandingsResponse {
  league: {
    id: number;
    name: string;
    season: number;
    logo?: string;
    country?: string;
    flag?: string;
  };
  standings: StandingRow[];
}

export interface FixtureStatisticItem {
  type: string;
  value: number | string | null;
}

export interface FixtureTeamStatistics {
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  statistics: FixtureStatisticItem[];
}

export interface FixtureStatisticsResponse {
  fixtureId: string;
  results: number;
  response: FixtureTeamStatistics[];
}
