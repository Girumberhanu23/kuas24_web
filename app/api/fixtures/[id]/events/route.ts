import { NextResponse } from "next/server";
import type { FixtureEvent } from "../../../../lib/types";

type ApiSportsEventsResponse = {
  results: number;
  response: FixtureEvent[];
};

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await context.params;
  const fixtureId = String(resolvedParams?.id ?? "").trim();

  const fixtureIdFromPath = (() => {
    const segments = new URL(req.url).pathname.split("/").filter(Boolean);
    const idCandidate = segments.at(-2);
    return idCandidate ? idCandidate.trim() : "";
  })();

  const effectiveFixtureId = fixtureId || fixtureIdFromPath;

  if (!effectiveFixtureId) {
    return NextResponse.json({ error: "Missing fixture id" }, { status: 400 });
  }

  const baseUrl =
    process.env.API_SPORTS_BASE_URL?.trim() ||
    "https://v3.football.api-sports.io";
  const apiKey = process.env.API_SPORTS_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing API_SPORTS_KEY. Add it to .env.local (server-side only).",
      },
      { status: 500 }
    );
  }

  const upstream = new URL("/fixtures/events", baseUrl);
  upstream.searchParams.set("fixture", effectiveFixtureId);

  const res = await fetch(upstream.toString(), {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Upstream API-Sports request failed",
        status: res.status,
        body: bodyText.slice(0, 2000),
      },
      { status: 502 }
    );
  }

  const data = (await res.json()) as ApiSportsEventsResponse;

  return NextResponse.json({
    fixtureId: effectiveFixtureId,
    results: data.results ?? 0,
    events: data.response ?? [],
  });
}
