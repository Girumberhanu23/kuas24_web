// app/api/fixtures/route.ts
import { NextResponse } from "next/server";
import {
  FEATURED_LEAGUE_IDS,
  getLeagueSortIndex,
  isFeaturedLeagueId,
} from "../../lib/leagues";
import { getLocalLeagueLogo } from "../../lib/leagueLogos";

type ApiSportsFixturesResponse = {
  response: Array<{
    fixture: {
      id: number;
      date: string;
      referee?: string | null;
      status: { short: string; elapsed: number | null };
    };
    league: { id: number; name: string; logo?: string };
    teams: {
      home: { name: string; logo?: string };
      away: { name: string; logo?: string };
    };
    goals: { home: number | null; away: number | null };
  }>;
};

function mapStatus(short: string): "live" | "finished" | "upcoming" {
  const s = short.toUpperCase();
  if (["FT", "AET", "PEN"].includes(s)) return "finished";
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(s)) return "live";
  return "upcoming";
}

async function fetchFixturesFromApiSports(baseUrl: string, apiKey: string, params: URLSearchParams) {
  const upstream = new URL("/fixtures", baseUrl);
  params.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });

  const res = await fetch(upstream.toString(), {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(bodyText.slice(0, 2000) || `Upstream API-Sports request failed (${res.status})`);
  }

  return (await res.json()) as ApiSportsFixturesResponse;
}

function mapFixtureItem(item: ApiSportsFixturesResponse["response"][number]) {
  const status = mapStatus(item.fixture.status.short);
  const elapsed = item.fixture.status.elapsed;
  const time = new Date(item.fixture.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: String(item.fixture.id),
    leagueId: String(item.league.id),
    league: item.league.name,
      leagueLogo: getLocalLeagueLogo(item.league.name, item.league.id) ?? item.league.logo,
    referee: item.fixture.referee ?? undefined,
    homeTeam: item.teams.home.name,
    homeTeamLogo: item.teams.home.logo,
    awayTeam: item.teams.away.name,
    awayTeamLogo: item.teams.away.logo,
    homeScore: item.goals.home,
    awayScore: item.goals.away,
    date: item.fixture.date,
    time,
    status,
    minute: status === "live" && elapsed != null ? `${elapsed}'` : undefined,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date"); // YYYY-MM-DD (optional)
  const leagueId = url.searchParams.get("league") ?? undefined;
  const yearFromDate = date ? new Date(date).getFullYear().toString() : null;
  const season =
    url.searchParams.get("season") ??
    yearFromDate ??
    process.env.API_SPORTS_DEFAULT_SEASON ??
    String(new Date().getFullYear());

  const baseUrl = process.env.API_SPORTS_BASE_URL?.trim() || "https://v3.football.api-sports.io";
  const apiKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API_SPORTS_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  if (leagueId && !isFeaturedLeagueId(leagueId)) {
    return NextResponse.json({ fixtures: [] });
  }

  const leaguesToFetch = leagueId ? [leagueId] : FEATURED_LEAGUE_IDS;

  try {
    const responses = await Promise.all(
      leaguesToFetch.map(async (id) => {
        const params = new URLSearchParams();
        params.set("season", season);
        params.set("league", id);
        if (date) params.set("date", date);
        const data = await fetchFixturesFromApiSports(baseUrl, apiKey, params);
        return data.response ?? [];
      })
    );

    const seen = new Set<number>();
    const items = responses.flat().filter((item) => {
      if (seen.has(item.fixture.id)) return false;
      seen.add(item.fixture.id);
      return isFeaturedLeagueId(item.league.id);
    });

    const fixtures = items
      .map(mapFixtureItem)
      .sort((a, b) => {
        const byLeague = getLeagueSortIndex(a.leagueId) - getLeagueSortIndex(b.leagueId);
        if (byLeague !== 0) return byLeague;
        return new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime();
      });

    return NextResponse.json({ fixtures });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Upstream API-Sports request failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
