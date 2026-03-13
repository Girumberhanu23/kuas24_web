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
      const body = await request.text();
      headers.set("Content-Type", "application/json");
      init.body = body;
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