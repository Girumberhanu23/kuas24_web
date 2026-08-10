import { NextResponse } from "next/server";

function mapStatus(short: string): "live" | "finished" | "upcoming" {
  const s = short.toUpperCase();
  if (["FT", "AET", "PEN"].includes(s)) return "finished";
  if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(s)) return "live";
  return "upcoming";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const league = url.searchParams.get("league") ?? process.env.API_SPORTS_DEFAULT_LEAGUE;
  const season = url.searchParams.get("season") ?? process.env.API_SPORTS_DEFAULT_SEASON ?? String(new Date().getFullYear());
  const round  = url.searchParams.get("round");   // if provided, fetch fixtures for that round

  if (!league) {
    return NextResponse.json({ error: "Missing league parameter." }, { status: 400 });
  }

  const apiKey = process.env.API_SPORTS_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "Missing API_SPORTS_KEY" }, { status: 500 });

  const base = "https://v3.football.api-sports.io";

  if (round) {
    // Fetch fixtures for a specific round
    const upstream = new URL("/fixtures", base);
    upstream.searchParams.set("league", league);
    upstream.searchParams.set("season", season);
    upstream.searchParams.set("round", round);

    const res = await fetch(upstream.toString(), {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: `Upstream failed: ${res.status}` }, { status: 502 });

    const data = await res.json();
    const fixtures = (data.response ?? []).map((item: any) => {
      const status = mapStatus(item.fixture.status.short);
      return {
        id: String(item.fixture.id),
        date: item.fixture.date,
        status,
        minute: status === "live" ? `${item.fixture.status.elapsed}'` : undefined,
        home: { name: item.teams.home.name, logo: item.teams.home.logo, score: item.goals.home },
        away: { name: item.teams.away.name, logo: item.teams.away.logo, score: item.goals.away },
      };
    });
    return NextResponse.json({ fixtures });
  }

  // Fetch list of rounds
  const upstream = new URL("/fixtures/rounds", base);
  upstream.searchParams.set("league", league);
  upstream.searchParams.set("season", season);

  const res = await fetch(upstream.toString(), {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: `Upstream failed: ${res.status}` }, { status: 502 });

  const data = await res.json();
  const allRounds: string[] = data.response ?? [];

  // Filter to knockout rounds only
  const knockout = allRounds.filter((r) => {
    const l = r.toLowerCase();
    return l.includes("round of") || l.includes("quarter") || l.includes("semi") || l.includes("final") || l.includes("3rd");
  });

  return NextResponse.json({ rounds: knockout.length ? knockout : allRounds });
}
