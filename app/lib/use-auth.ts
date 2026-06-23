"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AUTH_CHANGE_EVENT,
  clearAuthSession,
  isBroadcaster,
  readAuthSession,
  type AuthSession,
} from "./auth";

export function useAuth() {
  // Important: don't read from localStorage during the first render.
  // Client Components can be pre-rendered on the server; reading storage on the
  // client would cause the initial client render to diverge from the server HTML.
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const sync = () => setSession(readAuthSession());

    // Load the session after mount so SSR + first hydration render match.
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  const auth = useMemo(
    () => ({
      session,
      token: session?.token ?? null,
      user: session?.user ?? null,
      role: session?.user.role ?? null,
      isAuthenticated: !!session,
      isBroadcaster: isBroadcaster(session),
      logout: clearAuthSession,
    }),
    [session]
  );

  return auth;
}