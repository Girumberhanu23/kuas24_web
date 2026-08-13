import { NextResponse } from "next/server";

import { API_BASE_URL } from "../../../lib/api";

function buildForwardHeaders(request: Request): Headers {
  const headers = new Headers({
    Accept: "application/json",
  });

  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  if (authorization) headers.set("authorization", authorization);
  if (cookie) headers.set("cookie", cookie);

  return headers;
}

async function proxyPreferencesRequest(request: Request, method: "GET" | "POST") {
  try {
    const headers = buildForwardHeaders(request);
    const init: RequestInit = {
      method,
      cache: "no-store",
      headers,
    };

    if (method === "POST") {
      // Parse and re-stringify the JSON body to ensure upstream receives
      // a proper JSON object (avoids cases where arrays arrive as stringified values).
      let parsedBody: unknown = undefined;
      try {
        parsedBody = await request.json();
      } catch {
        // If parsing fails fall back to raw text
        const raw = await request.text();
        try {
          parsedBody = JSON.parse(raw);
        } catch {
          parsedBody = raw;
        }
      }

      // Normalize selectedLeagues/selectedClubs if they were sent as strings
      if (parsedBody && typeof parsedBody === "object") {
        const pb = parsedBody as Record<string, unknown>;
        for (const key of ["selectedLeagues", "selectedClubs"]) {
          const val = pb[key];
          if (typeof val === "string") {
            // try JSON.parse first (handles '["39","2"]' or "['39','2']")
            try {
              pb[key] = JSON.parse(val.replace(/'/g, '"'));
            } catch {
              // fallback: extract numbers/words between brackets
              const matches = val.match(/\d+/g);
              if (matches) pb[key] = matches.map((m) => String(m));
              else pb[key] = [];
            }
          }
          // if it's an array, ensure entries are strings
          if (Array.isArray(pb[key])) {
            pb[key] = (pb[key] as unknown[]).map((v) => String(v));
          }
        }
      }

      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(parsedBody);
    }

    const upstream = await fetch(`${API_BASE_URL}personalization/preferences`, init);
    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = (await upstream.json()) as unknown;
      return NextResponse.json(payload, { status: upstream.status });
    }

    const textBody = await upstream.text();
    return NextResponse.json(
      {
        error: "Personalization preferences endpoint returned non-JSON response.",
        body: textBody.slice(0, 2000),
      },
      { status: upstream.status || 502 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch personalization preferences from upstream backend.",
      },
      { status: 502 }
    );
  }
}

export async function GET(request: Request) {
  return proxyPreferencesRequest(request, "GET");
}

export async function POST(request: Request) {
  return proxyPreferencesRequest(request, "POST");
}