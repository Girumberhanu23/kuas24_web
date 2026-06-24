import { NextResponse } from "next/server";
import type { StandingRow } from "../../lib/types";

type ApiSportsStandingsResponse = {
  response: Array<{
    league: {
      id: number;
      name: string;
      country?: string;
      logo?: string;
      flag?: string;
      season: number;
      standings: StandingRow[][];
    };
  }>;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const league = url.searchParams.get("league") ?? "39";
  const season = url.searchParams.get("season") ?? "2026";

  const baseUrl = "https://v3.football.api-sports.io";
  const apiKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API_SPORTS_KEY." }, { status: 500 });
  }

  const upstream = new URL("/standings", baseUrl);
  upstream.searchParams.set("league", league);
  upstream.searchParams.set("season", season);

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

  const data = (await res.json()) as ApiSportsStandingsResponse;
  const leagueData = data.response?.[0]?.league;
  const allGroups = leagueData?.standings ?? [];

  if (!leagueData || !allGroups.length) {
    return NextResponse.json({ error: "Standings not available" }, { status: 404 });
  }

  return NextResponse.json({
    league: {
      id: leagueData.id,
      name: leagueData.name,
      season: leagueData.season,
      logo: leagueData.logo,
      country: leagueData.country,
      flag: leagueData.flag,
    },
    standings: allGroups[0],      // first group (for single-table leagues)
    groups: allGroups,             // all groups (for World Cup / group stage)
  });
}
