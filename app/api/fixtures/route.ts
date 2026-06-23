// app/api/fixtures/route.ts
import { NextResponse } from "next/server";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const leagueId = url.searchParams.get("league");   // numeric league id (optional)
  const season   = url.searchParams.get("season") ?? "2026";
  const date     = url.searchParams.get("date");     // YYYY-MM-DD (optional)

  const baseUrl = process.env.API_SPORTS_BASE_URL?.trim() || "https://v3.football.api-sports.io";
  const apiKey  = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API_SPORTS_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  // Require at least one filter — the API won't return all fixtures without one
  if (!leagueId && !date) {
    return NextResponse.json({ fixtures: [] });
  }

  const upstream = new URL("/fixtures", baseUrl);
  upstream.searchParams.set("season", season);
  if (leagueId) upstream.searchParams.set("league", leagueId);
  if (date)     upstream.searchParams.set("date", date);

  const res = await fetch(upstream.toString(), {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Upstream API-Sports request failed", status: res.status, body: bodyText.slice(0, 2000) },
      { status: 502 }
    );
  }

  const data = (await res.json()) as ApiSportsFixturesResponse;

  const fixtures = (data.response ?? []).map((item) => {
    const status  = mapStatus(item.fixture.status.short);
    const elapsed = item.fixture.status.elapsed;
    const time    = new Date(item.fixture.date).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });
    return {
      id:            String(item.fixture.id),
      leagueId:      String(item.league.id),
      league:        item.league.name,
      leagueLogo:    item.league.logo,
      referee:       item.fixture.referee ?? undefined,
      homeTeam:      item.teams.home.name,
      homeTeamLogo:  item.teams.home.logo,
      awayTeam:      item.teams.away.name,
      awayTeamLogo:  item.teams.away.logo,
      homeScore:     item.goals.home,
      awayScore:     item.goals.away,
      date:          item.fixture.date,
      time,
      status,
      minute: status === "live" && elapsed != null ? `${elapsed}'` : undefined,
    };
  });

  return NextResponse.json({ fixtures });
}
