import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const league = url.searchParams.get("league") ?? "1";
  const season = url.searchParams.get("season") ?? "2022";
  const type = url.searchParams.get("type") ?? "topscorers"; // topscorers | topassists | topyellowcards

  const apiKey = process.env.API_SPORTS_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "Missing API_SPORTS_KEY" }, { status: 500 });

  const validTypes = ["topscorers", "topassists", "topyellowcards"];
  const endpoint = validTypes.includes(type) ? type : "topscorers";

  const upstream = new URL(`/players/${endpoint}`, "https://v3.football.api-sports.io");
  upstream.searchParams.set("league", league);
  upstream.searchParams.set("season", season);

  const res = await fetch(upstream.toString(), {
    headers: { "x-apisports-key": apiKey },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: `Upstream failed: ${res.status}` }, { status: 502 });

  const data = await res.json();
  return NextResponse.json({ players: data.response ?? [] });
}
