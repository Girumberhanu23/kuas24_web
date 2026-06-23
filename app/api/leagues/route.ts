// app/api/leagues/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API_SPORTS_KEY" }, { status: 500 });
  }

  // Fetch both League and Cup types so World Cup, Champions League etc. are included
  const [leagueRes, cupRes] = await Promise.all([
    fetch("https://v3.football.api-sports.io/leagues?season=2026&type=League", {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 86400 },
    }),
    fetch("https://v3.football.api-sports.io/leagues?season=2026&type=Cup", {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: 86400 },
    }),
  ]);

  if (!leagueRes.ok && !cupRes.ok) {
    return NextResponse.json({ error: "Failed to fetch leagues" }, { status: 502 });
  }

  const leagueData = leagueRes.ok ? await leagueRes.json() : { response: [] };
  const cupData = cupRes.ok ? await cupRes.json() : { response: [] };

  const combined = [...(leagueData.response ?? []), ...(cupData.response ?? [])];

  if (combined.length === 0) {
    return NextResponse.json({ leagues: [] });
  }

  const leagues = combined.map((item: any) => ({
    id: String(item.league.id),
    name: item.league.name,
    logo: item.league.logo,
    country: item.country?.name ?? "",
  }));

  // Sort: put well-known competitions first
  const priority = [
    "World Cup", "UEFA Champions League", "Premier League",
    "La Liga", "Serie A", "Bundesliga", "Ligue 1", "UEFA Europa League",
  ];
  leagues.sort((a: any, b: any) => {
    const ai = priority.indexOf(a.name);
    const bi = priority.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ leagues });
}
