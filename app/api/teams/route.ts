// app/api/teams/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const league = url.searchParams.get("league");
  const season = url.searchParams.get("season") ?? process.env.API_SPORTS_DEFAULT_SEASON ?? String(new Date().getFullYear());

  if (!league) {
    return NextResponse.json({ error: "Missing league parameter." }, { status: 400 });
  }

  const apiKey = process.env.API_SPORTS_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "Missing API_SPORTS_KEY" }, { status: 500 });

  const base = process.env.API_SPORTS_BASE_URL?.trim() || "https://v3.football.api-sports.io";

  const upstream = new URL("/teams", base);
  upstream.searchParams.set("league", league);
  upstream.searchParams.set("season", season);

  const res = await fetch(upstream.toString(), {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: `Upstream failed: ${res.status}`, details: text.slice(0, 2000) }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  const resp = (data as unknown) as { response?: unknown[] } | null | undefined;
  if (!resp || !Array.isArray(resp.response)) {
    return NextResponse.json({ teams: [] });
  }
  const teams = resp.response.map((item) => {
    const entry = item as Record<string, unknown>;
    const team = (entry.team ?? {}) as Record<string, unknown>;
    return {
      id: String(team.id ?? ""),
      name: String(team.name ?? ""),
      code: team.code as string | undefined,
      country: team.country as string | undefined,
      founded: (team.founded as number) ?? undefined,
      national: (team.national as boolean) ?? undefined,
      logo: team.logo as string | undefined,
      venue: (entry.venue ?? null) as Record<string, unknown> | null,
    };
  });

  return NextResponse.json({ teams });
}
