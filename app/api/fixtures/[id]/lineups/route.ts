import { NextResponse } from "next/server";
import { fetchLineups } from "../../../../lib/lineup-service";

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

  const baseUrl = "https://v3.football.api-sports.io";
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

  const result = await fetchLineups(effectiveFixtureId, apiKey, baseUrl);

  if (result.error) {
    const status = result.error.status ?? 502;
    return NextResponse.json(
      {
        error: result.error.error,
        details: result.error.details,
      },
      { status }
    );
  }

  return NextResponse.json(result.data);
}
