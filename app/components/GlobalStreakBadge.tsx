"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/use-auth";
import { usePredictorStrings } from "../lib/predictor-strings";
import { fetchMyStreak } from "../lib/predictor";
import type { StreakSummary } from "../lib/predictor-types";

const FLAME_PATH =
  "M12 2s-6 5.7-6 10.8A6 6 0 0 0 12 19a6 6 0 0 0 6-6.2c0-2.1-1.1-3.7-2.1-4.7.2 1.6-.5 2.7-1.6 2.7-1.3 0-1.6-1.1-1.1-2.2C13.8 6.5 12 2 12 2Z";

const POLL_INTERVAL_MS = 60_000;

export default function GlobalStreakBadge() {
  const { isAuthenticated } = useAuth();
  const strings = usePredictorStrings();
  const [streak, setStreak] = useState<StreakSummary | null>(null);

  useEffect(() => {
    // No setState here for the logged-out case: the render guard below
    // already keys off isAuthenticated directly, so stale streak state
    // from a prior session can't cause the badge to render incorrectly.
    if (!isAuthenticated) return;

    let cancelled = false;
    const load = () => {
      fetchMyStreak()
        .then((s) => {
          if (!cancelled) setStreak(s);
        })
        .catch(() => {
          // Silent — a global nav badge shouldn't surface fetch errors.
        });
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || !streak || streak.isBroken || streak.currentStreak <= 0) return null;

  return (
    <Link
      href="/predictor"
      title={strings.streak.globalBadge(streak.currentStreak)}
      className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1.5 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-500/20 dark:text-orange-400"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
        <path d={FLAME_PATH} />
      </svg>
      <span className="whitespace-nowrap">{strings.streak.globalBadge(streak.currentStreak)}</span>
    </Link>
  );
}
