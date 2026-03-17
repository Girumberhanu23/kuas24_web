import { NextResponse } from "next/server";

import { API_BASE_URL } from "../../../lib/api";

const AUTH_ACTION_PATHS: Record<string, string> = {
  register: "user/registerUser",
  login: "user/login",
  "forgot-password": "user/forgot-password",
  "verify-otp": "user/verify-otp",
  "reset-password": "user/reset-password",
};

function buildForwardHeaders(request: Request): Headers {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");

  if (authorization) headers.set("authorization", authorization);
  if (cookie) headers.set("cookie", cookie);

  return headers;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;
  const upstreamPath = AUTH_ACTION_PATHS[action];

  if (!upstreamPath) {
    return NextResponse.json(
      {
        error: "Unsupported auth action.",
      },
      { status: 404 }
    );
  }

  try {
    const body = await request.text();
    const upstream = await fetch(`${API_BASE_URL}${upstreamPath}`, {
      method: "POST",
      cache: "no-store",
      headers: buildForwardHeaders(request),
      body,
    });

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = (await upstream.json()) as unknown;
      return NextResponse.json(payload, { status: upstream.status });
    }

    const textBody = await upstream.text();
    return NextResponse.json(
      {
        error: "Authentication endpoint returned non-JSON response.",
        body: textBody.slice(0, 2000),
      },
      { status: upstream.status || 502 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Failed to reach upstream authentication backend.",
      },
      { status: 502 }
    );
  }
}