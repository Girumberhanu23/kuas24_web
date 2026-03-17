import type { LineupTeam, LineupPlayer, Coach, TeamColors } from "./types";

/* ------------------------------------------------------------------ */
/*  API-Sports Response Types (Internal)                               */
/* ------------------------------------------------------------------ */

interface ApiSportsPlayerEntry {
  player: {
    id: number;
    name: string;
    photo?: string;
    number: number;
    pos: string;
    grid: string | null;
  };
}

interface ApiSportsFixturePlayerStatEntry {
  player: {
    id: number;
    name: string;
    photo?: string;
  };
}

interface ApiSportsFixturePlayersResponse {
  response: Array<{
    players: ApiSportsFixturePlayerStatEntry[];
  }>;
}

interface ApiSportsTeamColors {
  player: {
    primary: string;
    number: string;
    border: string;
  };
  goalkeeper: {
    primary: string;
    number: string;
    border: string;
  };
}

interface ApiSportsCoach {
  id: number;
  name: string;
  photo?: string;
}

interface ApiSportsLineupTeam {
  team: {
    id: number;
    name: string;
    logo?: string;
    colors?: ApiSportsTeamColors;
  };
  coach?: ApiSportsCoach;
  formation?: string;
  startXI: ApiSportsPlayerEntry[];
  substitutes: ApiSportsPlayerEntry[];
}

interface ApiSportsLineupsResponse {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  response: ApiSportsLineupTeam[];
}

/* ------------------------------------------------------------------ */
/*  Mapper Functions                                                   */
/* ------------------------------------------------------------------ */

function mapPlayer(
  entry: ApiSportsPlayerEntry,
  playerPhotosById?: Map<number, string>
): LineupPlayer {
  return {
    id: entry.player.id,
    name: entry.player.name,
    photo: playerPhotosById?.get(entry.player.id) ?? entry.player.photo,
    number: entry.player.number,
    pos: entry.player.pos,
    grid: entry.player.grid,
  };
}

function mapColors(
  colors?: ApiSportsTeamColors
): { player: TeamColors; goalkeeper: TeamColors } | undefined {
  if (!colors) return undefined;
  return {
    player: {
      primary: colors.player.primary,
      number: colors.player.number,
      border: colors.player.border,
    },
    goalkeeper: {
      primary: colors.goalkeeper.primary,
      number: colors.goalkeeper.number,
      border: colors.goalkeeper.border,
    },
  };
}

function mapCoach(coach?: ApiSportsCoach): Coach | undefined {
  if (!coach) return undefined;
  return {
    id: coach.id,
    name: coach.name,
    photo: coach.photo,
  };
}

function mapLineupTeam(
  team: ApiSportsLineupTeam,
  playerPhotosById?: Map<number, string>
): LineupTeam {
  return {
    team: {
      id: team.team.id,
      name: team.team.name,
      logo: team.team.logo,
      colors: mapColors(team.team.colors),
    },
    coach: mapCoach(team.coach),
    formation: team.formation,
    startXI: team.startXI.map((player) => mapPlayer(player, playerPhotosById)),
    substitutes: team.substitutes.map((player) => mapPlayer(player, playerPhotosById)),
  };
}

async function fetchFixturePlayerPhotos(
  fixtureId: string,
  apiKey: string,
  baseUrl: string
): Promise<Map<number, string>> {
  const photosById = new Map<number, string>();
  const url = new URL("/fixtures/players", baseUrl);
  url.searchParams.set("fixture", fixtureId);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) return photosById;

    const data = (await res.json()) as ApiSportsFixturePlayersResponse;
    for (const teamEntry of data.response ?? []) {
      for (const playerEntry of teamEntry.players ?? []) {
        const playerId = playerEntry.player?.id;
        const playerPhoto = playerEntry.player?.photo?.trim();
        if (playerId && playerPhoto) {
          photosById.set(playerId, playerPhoto);
        }
      }
    }
  } catch {
    return photosById;
  }

  return photosById;
}

/* ------------------------------------------------------------------ */
/*  Service Functions                                                  */
/* ------------------------------------------------------------------ */

export interface FetchLineupsResult {
  home: LineupTeam;
  away: LineupTeam;
}

export interface FetchLineupsError {
  error: string;
  status?: number;
  details?: string;
}

export async function fetchLineups(
  fixtureId: string,
  apiKey: string,
  baseUrl = "https://v3.football.api-sports.io"
): Promise<{ data?: FetchLineupsResult; error?: FetchLineupsError }> {
  const url = new URL("/fixtures/lineups", baseUrl);
  url.searchParams.set("fixture", fixtureId);
  const playerPhotosById = await fetchFixturePlayerPhotos(fixtureId, apiKey, baseUrl);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      return {
        error: {
          error: "Upstream API-Sports request failed",
          status: res.status,
          details: bodyText.slice(0, 2000),
        },
      };
    }

    const data = (await res.json()) as ApiSportsLineupsResponse;
    const [homeRaw, awayRaw] = data.response ?? [];

    if (!homeRaw || !awayRaw) {
      return {
        error: {
          error: "Lineups not available",
          status: 404,
        },
      };
    }

    return {
      data: {
        home: mapLineupTeam(homeRaw, playerPhotosById),
        away: mapLineupTeam(awayRaw, playerPhotosById),
      },
    };
  } catch (err) {
    return {
      error: {
        error: "Network error fetching lineups",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
