import type { LeagueCategory } from "./types";

/** Featured leagues in display order (Champions League first, Premier League second). */
export const FEATURED_LEAGUES = [
  { id: "2", name: "UEFA Champions League" },
  { id: "39", name: "Premier League" },
  { id: "363", name: "Ethiopian Premier League" },
  { id: "1228", name: "Ethiopia Cup" },
  { id: "140", name: "La Liga" },
  { id: "71", name: "Serie A" },
  { id: "45", name: "FA Cup" },
] as const;

export const FEATURED_LEAGUE_IDS = FEATURED_LEAGUES.map((l) => l.id);

/** Hyphen-separated league IDs for batch-style API params (e.g. live=2-39-140). */
export const FEATURED_LEAGUE_IDS_PARAM = FEATURED_LEAGUE_IDS.join("-");

const leagueSortIndex = new Map<string, number>(
  FEATURED_LEAGUE_IDS.map((id, index) => [id, index])
);

export function isFeaturedLeagueId(id: string | number | undefined | null): boolean {
  if (id == null) return false;
  return leagueSortIndex.has(String(id));
}

export function getLeagueSortIndex(id: string | number | undefined | null): number {
  if (id == null) return Number.MAX_SAFE_INTEGER;
  return leagueSortIndex.get(String(id)) ?? Number.MAX_SAFE_INTEGER;
}

export function sortByLeaguePriority<T extends { leagueId?: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => getLeagueSortIndex(a.leagueId) - getLeagueSortIndex(b.leagueId)
  );
}

export const featuredLeagueCategories: LeagueCategory[] = [
  { id: "all", name: "All Leagues" },
  ...FEATURED_LEAGUES.map((l) => ({ id: l.name, name: l.name })),
];
