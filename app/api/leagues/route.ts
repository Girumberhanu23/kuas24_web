// app/api/leagues/route.ts
import { NextResponse } from "next/server";
import { FEATURED_LEAGUES } from "../../lib/leagues";
import { getLocalLeagueLogo } from "../../lib/leagueLogos";

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API_SPORTS_KEY" }, { status: 500 });
  }

  const season = process.env.API_SPORTS_DEFAULT_SEASON?.trim() || String(new Date().getFullYear());
  const baseUrl = process.env.API_SPORTS_BASE_URL?.trim() || "https://v3.football.api-sports.io";

  const leagues = await Promise.all(
    FEATURED_LEAGUES.map(async (league) => {
      try {
        const res = await fetch(`${baseUrl}/leagues?id=${league.id}&season=${season}`, {
          headers: { "x-apisports-key": apiKey },
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const data = await res.json();
          const item = data.response?.[0];
          if (item) {
            return {
              id: league.id,
              name: league.name,
              logo: getLocalLeagueLogo(league.name, league.id) ?? item.league?.logo ?? "",
              country: item.country?.name ?? "",
            };
          }
        }
      } catch {
        // Fall back to static config below.
      }

      return {
        id: league.id,
        name: league.name,
        logo: getLocalLeagueLogo(league.name, league.id) ?? "",
        country: "",
      };
    })
  );

  return NextResponse.json({ leagues });
}
