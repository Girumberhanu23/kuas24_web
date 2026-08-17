import { NextResponse } from "next/server";
import { API_BASE_URL } from "./api";

function buildForwardHeaders(request: Request): Headers {
  const headers = new Headers({ Accept: "application/json" });

  const authorization = request.headers.get("authorization");
  const accessToken = request.headers.get("x-access-token");
  const cookie = request.headers.get("cookie");

  if (authorization) headers.set("authorization", authorization);
  if (accessToken) headers.set("x-access-token", accessToken);
  if (cookie) headers.set("cookie", cookie);

  return headers;
}

export async function proxyPredictorRequest(
  request: Request,
  upstreamPath: string,
  method: "GET" | "POST"
): Promise<NextResponse> {
  try {
    const headers = buildForwardHeaders(request);
    const init: RequestInit = { method, cache: "no-store", headers };

    let upstreamUrl = `${API_BASE_URL}api/predictor/${upstreamPath}`;

    if (method === "GET") {
      const queryString = new URL(request.url).search;
      if (queryString) upstreamUrl += queryString;
    } else {
      const body = await request.text();
      headers.set("Content-Type", "application/json");
      init.body = body;
    }

    const upstream = await fetch(upstreamUrl, init);
    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = (await upstream.json()) as unknown;
      return NextResponse.json(payload, { status: upstream.status });
    }

    const textBody = await upstream.text();
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Predictor endpoint returned a non-JSON response.",
        body: textBody.slice(0, 2000),
      },
      { status: upstream.status || 502 }
    );
  } catch (error) {
    console.warn("[predictor-proxy] Failed to reach the predictor backend:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Failed to reach the predictor backend.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
