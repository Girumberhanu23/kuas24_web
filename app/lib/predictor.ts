import { getAuthHeaders } from "./auth";
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  PredictorFixture,
  PredictorPagination,
  PredictorPick,
  PredictorPrediction,
  StreakSummary,
} from "./predictor-types";

interface ApiEnvelope<T = unknown> {
  status?: string;
  message?: string;
  data?: T;
}

async function fetchPredictorJson<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const authHeaders = getAuthHeaders();

  let response: Response;

  try {
    response = await fetch(`/api/predictor/${path}`, {
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      "Unable to reach the predictor service. Please check your connection and try again."
    );
  }

  let payload: ApiEnvelope<T> | null = null;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Ignore non-JSON response bodies.
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        `Predictor request failed (HTTP ${response.status}).`
    );
  }

  if (payload?.status && payload.status !== "SUCCESS") {
    throw new Error(
      payload.message ||
        `Predictor request failed (HTTP ${response.status}).`
    );
  }

  if (!payload || payload.data === undefined) {
    throw new Error(
      "Predictor service returned an unexpected response."
    );
  }

  return payload.data;
}

/* ------------------------------------------------------------------ */
/*  Raw → normalized mappers                                          */
/* ------------------------------------------------------------------ */

interface RawTeam {
  id: number;
  name: string;
  logo?: string;
}

interface RawFixture {
  _id: string;
  apiFootballId: number;
  league: { id: number; name: string; country?: string };
  season: number;
  homeTeam: RawTeam;
  awayTeam: RawTeam;
  kickoff: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  resolvedResult: PredictorPick | null;
  resolvedAt: string | null;
  predictionsResolved: boolean;
  userPick?: PredictorPick | null;
  alreadyPicked?: boolean;
}

interface ApiSportsFixtureLike {
  id: string | number;
  leagueId?: string | number;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  date: string;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

function mapFixture(raw: RawFixture): PredictorFixture {
  return {
    id: raw._id,
    apiFootballId: raw.apiFootballId,
    league: raw.league,
    season: raw.season,
    homeTeam: raw.homeTeam,
    awayTeam: raw.awayTeam,
    kickoff: raw.kickoff,
    status: raw.status,
    homeScore: raw.homeScore,
    awayScore: raw.awayScore,
    resolvedResult: raw.resolvedResult,
    resolvedAt: raw.resolvedAt,
    predictionsResolved: raw.predictionsResolved,
    userPick: raw.userPick ?? null,
    alreadyPicked: raw.alreadyPicked ?? false,
  };
}

interface RawPrediction {
  _id: string;
  userId: string;
  fixtureId: RawFixture | string;
  pick: PredictorPick;
  pointsAwarded: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapApiSportsFixture(item: ApiSportsFixtureLike, index: number): PredictorFixture {
  const fixtureId = Number(item.id);
  const leagueId = Number(item.leagueId ?? 0);
  return {
    id: String(item.id),
    apiFootballId: Number.isFinite(fixtureId) ? fixtureId : index + 1,
    league: {
      id: Number.isFinite(leagueId) ? leagueId : 0,
      name: item.league ?? "League",
      country: undefined,
    },
    season: new Date(item.date).getFullYear(),
    homeTeam: {
      id: (fixtureId || index + 1) * 2,
      name: item.homeTeam,
      logo: item.homeTeamLogo,
    },
    awayTeam: {
      id: (fixtureId || index + 1) * 2 + 1,
      name: item.awayTeam,
      logo: item.awayTeamLogo,
    },
    kickoff: item.date,
    status: item.status ?? "upcoming",
    homeScore: item.homeScore ?? null,
    awayScore: item.awayScore ?? null,
    resolvedResult: null,
    resolvedAt: null,
    predictionsResolved: false,
    userPick: null,
    alreadyPicked: false,
  };
}

function mapPrediction(raw: RawPrediction): PredictorPrediction {
  return {
    id: raw._id,
    userId: raw.userId,
    fixture: typeof raw.fixtureId === "string" ? raw.fixtureId : mapFixture(raw.fixtureId),
    pick: raw.pick,
    pointsAwarded: raw.pointsAwarded,
    resolvedAt: raw.resolvedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

interface RawLeaderboardEntry {
  _id: string;
  userId: { _id: string; phone?: string | null; email?: string | null; role: "user" | "broadcaster" } | null;
  period: "DAILY" | "WEEKLY" | "ALL_TIME";
  points: number;
  rank: number;
  periodStart: string;
  periodEnd: string;
}

function mapLeaderboardEntry(raw: RawLeaderboardEntry): LeaderboardEntry {
  const userInfo = raw.userId ?? {
    _id: "unknown",
    phone: null,
    email: null,
    role: "user" as const,
  };

  return {
    id: raw._id,
    user: {
      id: userInfo._id,
      phone: userInfo.phone ?? null,
      email: userInfo.email ?? null,
      role: userInfo.role,
    },
    period: raw.period,
    points: raw.points,
    rank: raw.rank,
    periodStart: raw.periodStart,
    periodEnd: raw.periodEnd,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export async function fetchPredictorFixtures(options?: {
  league?: string;
  season?: string;
  date?: string;
}): Promise<PredictorFixture[]> {
  const query = new URLSearchParams();

  if (options?.league) {
    query.set("league", options.league);
  }

  if (options?.season) {
    query.set("season", options.season);
  }

  if (options?.date) {
    query.set("date", options.date);
  }

  const queryString = query.toString();

  const path = queryString
    ? `fixtures?${queryString}`
    : "fixtures";

  console.log("[Predictor API] Fetching fixtures:", path);

  try {
    const data = await fetchPredictorJson<{
      fixtures: RawFixture[];
    }>(path, {
      method: "GET",
    });

    console.log("[Predictor API] Fixture response:", {
      count: data.fixtures?.length ?? 0,
      fixtures: data.fixtures,
    });

    if (data.fixtures?.length) {
      return data.fixtures.map(mapFixture);
    }
  } catch (error) {
    console.error("[Predictor API] Predictor fixtures request failed:", error);
  }

  const endpoint = queryString
    ? `/api/fixtures?${queryString}`
    : "/api/fixtures";

  console.log("[Predictor API] Falling back to:", endpoint);

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Fixtures API returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      fixtures?: ApiSportsFixtureLike[];
    };

    console.log("[Predictor API] Fallback fixture response:", {
      count: payload.fixtures?.length ?? 0,
      fixtures: payload.fixtures,
    });

    return (payload.fixtures ?? []).map((item, index) =>
      mapApiSportsFixture(item, index)
    );
  } catch (error) {
    console.error("[Predictor API] Fallback fixtures request failed:", error);
    return [];
  }
}

export async function submitPrediction(
  fixtureId: string,
  pick: PredictorPick
): Promise<PredictorPrediction> {
  const data = await fetchPredictorJson<{ prediction: RawPrediction }>("predictions", {
    method: "POST",
    body: JSON.stringify({ fixtureId, pick }),
  });
  return mapPrediction(data.prediction);
}

export async function fetchMyPredictions(
  page = 1,
  limit = 20
): Promise<{ predictions: PredictorPrediction[]; pagination: PredictorPagination }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const data = await fetchPredictorJson<{
    predictions: RawPrediction[];
    pagination: PredictorPagination;
  }>(`predictions/me?${params}`, { method: "GET" });
  return {
    predictions: (data.predictions ?? []).map(mapPrediction),
    pagination: data.pagination,
  };
}

export async function fetchLeaderboard(
  period: LeaderboardPeriod,
  page = 1,
  limit = 20
): Promise<{ entries: LeaderboardEntry[]; pagination: PredictorPagination }> {
  const params = new URLSearchParams({ period, page: String(page), limit: String(limit) });
  const data = await fetchPredictorJson<{
    leaderboard: RawLeaderboardEntry[];
    pagination: PredictorPagination;
  }>(`leaderboard?${params}`, { method: "GET" });
  return {
    entries: (data.leaderboard ?? []).map(mapLeaderboardEntry),
    pagination: data.pagination,
  };
}

export async function fetchMyStreak(): Promise<StreakSummary> {
  const data = await fetchPredictorJson<{ streak: StreakSummary }>("streak/me", { method: "GET" });
  return data.streak;
}

export async function restoreStreak(): Promise<StreakSummary> {
  const data = await fetchPredictorJson<{ streak: StreakSummary }>("streak/restore", { method: "POST" });
  return data.streak;
}
