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

export async function GET(request: Request) {
  try {
    const upstream = await fetch(`${API_BASE_URL}personalization/options`, {
      method: "GET",
      cache: "no-store",
      headers: buildForwardHeaders(request),
    });

    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = (await upstream.json()) as unknown;
      return NextResponse.json(payload, { status: upstream.status });
    }

    const textBody = await upstream.text();
    return NextResponse.json(
      {
        error: "Personalization options endpoint returned non-JSON response.",
        body: textBody.slice(0, 2000),
      },
      { status: upstream.status || 502 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch personalization options from upstream backend.",
      },
      { status: 502 }
    );
  }
}