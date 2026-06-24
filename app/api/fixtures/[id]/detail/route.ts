import { NextResponse } from "next/server";

function mapStatus(short: string): "live" | "finished" | "upcoming" {
  const s = short.toUpperCase();
  if (["FT", "AET", "PEN"].includes(s)) return "finished";
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(s)) return "live";
  return "upcoming";
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const fixtureId = params.id;
  const apiKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API_SPORTS_KEY" }, { status: 500 });
  }

  const url = `https://v3.football.api-sports.io/fixtures?id=${encodeURIComponent(fixtureId)}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Upstream failed: ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
  const item = data.response?.[0];
  if (!item) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  const status = mapStatus(item.fixture.status.short);
  const elapsed = item.fixture.status.elapsed;
  const time = new Date(item.fixture.date).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return NextResponse.json({
    fixture: {
      id: String(item.fixture.id),
      leagueId: String(item.league.id),
      league: item.league.name,
      leagueLogo: item.league.logo,
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
    },
  });
}
