import type { Locale } from "./locale";
import type { LeagueCategory } from "./types";

const AMHARIC_LEAGUE_NAMES: Record<string, string> = {
  "UEFA Champions League": "የዩኤፋ ቻምፒዮንስ ሊግ",
  "Premier League": "ፕሪምየር ሊግ",
  "Ethiopian Premier League": "የኢትዮጵያ ፕሪሚየር ሊግ",
  "Ethiopia Cup": "ኢትዮጵያ ካፕ",
  "La Liga": "ላ ሊጋ",
  "Serie A": "ሴሪ አ",
  "FA Cup": "ኤፍ ኤ ካፕ",
  All: "ሁሉም",
  "All Leagues": "ሁሉም ሊጎች",
};

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

const featuredLeagueNameById = new Map<string, string>(
  FEATURED_LEAGUES.map((league) => [league.id, league.name])
);

export function getLocalizedLeagueName(
  name: string | null | undefined,
  locale: Locale = "am",
  id?: string | number | null
): string {
  const canonicalName = id == null ? undefined : featuredLeagueNameById.get(String(id));
  if (!name && !canonicalName) return "";
  if (canonicalName && locale === "am") return AMHARIC_LEAGUE_NAMES[canonicalName] ?? canonicalName;
  if (canonicalName && !name) return canonicalName;

  const normalized = String(name).trim();
  if (locale !== "am") return normalized;
  return AMHARIC_LEAGUE_NAMES[normalized] ?? normalized;
}

export function localizeLeagueCategories(
  categories: LeagueCategory[],
  locale: Locale = "am"
): LeagueCategory[] {
  return categories.map((category) => ({
    ...category,
    name:
      category.id === "all"
        ? (locale === "am" ? AMHARIC_LEAGUE_NAMES[category.name] ?? category.name : category.name)
        : getLocalizedLeagueName(category.name, locale, category.id),
  }));
}

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
