export const LEAGUE_LOGO_MAP: Record<string, string> = {
  "UEFA Champions League": "/images/leagues/uefa-champions-league.png",
  "Premier League": "/images/leagues/premier-league.png",
  "La Liga": "/images/leagues/la-liga.png",
  "FA Cup": "/images/leagues/fa-cup.png",
  "Ethiopia Cup": "/images/leagues/ethiopia-cup.png",
  "Ethiopian Premier League": "/images/leagues/ethiopia-pl.jpeg",
}

export function getLeagueLogoByName(name?: string | null): string | null {
  if (!name) return null
  return LEAGUE_LOGO_MAP[name] ?? null
}

export function getLeagueLogoById(id?: string | number | null): string | null {
  // In this project we primarily map by name; leave placeholder in case
  // future mapping by id is needed.
  return null
}

export function getLocalLeagueLogo(name?: string | null, id?: string | number | null): string | null {
  return getLeagueLogoByName(name) ?? getLeagueLogoById(id)
}
