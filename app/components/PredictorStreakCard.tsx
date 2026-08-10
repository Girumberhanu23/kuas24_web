"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePredictorStrings } from "../lib/predictor-strings";
import { restoreStreak } from "../lib/predictor";
import { formatCountdown } from "../lib/countdown";
import type { StreakSummary } from "../lib/predictor-types";

const FLAME_PATH =
  "M12 2s-6 5.7-6 10.8A6 6 0 0 0 12 19a6 6 0 0 0 6-6.2c0-2.1-1.1-3.7-2.1-4.7.2 1.6-.5 2.7-1.6 2.7-1.3 0-1.6-1.1-1.1-2.2C13.8 6.5 12 2 12 2Z";

function useCountdownLabel(deadline: string | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return "";
  return formatCountdown(new Date(deadline).getTime() - now);
}

interface PredictorStreakCardProps {
  isAuthenticated: boolean;
  streak: StreakSummary | null;
  loading: boolean;
  onRestored: (streak: StreakSummary) => void;
}

export default function PredictorStreakCard({
  isAuthenticated,
  streak,
  loading,
  onRestored,
}: PredictorStreakCardProps) {
  const strings = usePredictorStrings();
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const countdownLabel = useCountdownLabel(streak?.restoreWindow ?? null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-bold text-text">{strings.streak.signInCta}</h2>
        <p className="mt-2 text-sm text-text-secondary">{strings.streak.signInBody}</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {strings.streak.signInButton}
        </Link>
      </div>
    );
  }

  if (loading || !streak) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleRestore = async () => {
    setRestoring(true);
    setRestoreError(null);
    try {
      const updated = await restoreStreak();
      onRestored(updated);
    } catch (e) {
      setRestoreError(e instanceof Error ? e.message : strings.streak.restoreError);
    } finally {
      setRestoring(false);
    }
  };

  if (streak.isBroken) {
    // API doesn't document what currentStreak holds once broken; fall back to
    // longestStreak so the callout always has a meaningful day count to show.
    const brokenDays = streak.currentStreak || streak.longestStreak;

    return (
      <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
        <div className="flex items-start gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-orange-500">
            <path d={FLAME_PATH} fill="currentColor" />
          </svg>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-text">{strings.streak.brokenTitle(brokenDays)}</h2>
            <p className="mt-1 text-sm text-text-secondary">{strings.streak.brokenBody}</p>

            {streak.restoreAvailable ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoring}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {restoring ? strings.streak.restoring : strings.streak.restoreCta}
                </button>
                {streak.restoreWindow && (
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                    {strings.streak.countdown(countdownLabel)}
                  </span>
                )}
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-card px-3 py-2 text-xs text-text-secondary">
                {strings.streak.restoreUnavailable}
              </p>
            )}

            {restoreError && (
              <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {restoreError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_20px_-4px_rgba(249,115,22,0.6)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d={FLAME_PATH} fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">{strings.streak.heading}</p>
          <p className="text-xl font-black text-text">{strings.streak.days(streak.currentStreak)}</p>
          <p className="text-xs text-text-secondary">{strings.streak.longest(streak.longestStreak)}</p>
        </div>
      </div>

      {streak.atRisk && (
        <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-600 dark:text-orange-400">
          {strings.streak.atRiskWarning}
        </p>
      )}
    </div>
  );
}
