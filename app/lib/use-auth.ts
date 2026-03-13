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
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  useEffect(() => {
    const sync = () => setSession(readAuthSession());

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