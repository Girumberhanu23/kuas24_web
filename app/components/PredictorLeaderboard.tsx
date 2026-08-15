"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePredictorStrings } from "../lib/predictor-strings";
import { fetchLeaderboard } from "../lib/predictor";
import { formatCountdown } from "../lib/countdown";
import type { LeaderboardEntry, LeaderboardPeriod, PredictorPagination } from "../lib/predictor-types";

const PAGE_LIMIT = 20;
const POLL_INTERVAL_MS = 60_000;

const TROPHY_PATH =
  "M6 3h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6V3Z M6 5H4a2 2 0 0 0 2 3 M18 5h2a2 2 0 0 1-2 3 M12 13v4 M9 21h6 M10 21v-2a2 2 0 0 1 4 0v2";

function maskPhone(phone?: string | null): string {
  if (!phone) return "Unknown";
  if (phone.length <= 4) return phone;
  return `••• ${phone.slice(-4)}`;
}

function getLeaderboardPlayerLabel(user: LeaderboardEntry["user"]): string {
  if (user.phone) return maskPhone(user.phone);
  if (user.email) return user.email;
  return "Unknown player";
}

function useDrawCountdownLabel(deadline: string | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return "";
  return formatCountdown(new Date(deadline).getTime() - now);
}

interface PredictorLeaderboardProps {
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export default function PredictorLeaderboard({ isAuthenticated, currentUserId }: PredictorLeaderboardProps) {
  const strings = usePredictorStrings();
  const [period, setPeriod] = useState<LeaderboardPeriod>("daily");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PredictorPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(page);
  pageRef.current = page;

  // The leaderboard endpoint requires a token on this backend — skip the
  // fetch entirely when logged out instead of surfacing a raw 401.
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setEntries([]);
    setPage(1);

    (async () => {
      try {
        const result = await fetchLeaderboard(period, 1, PAGE_LIMIT);
        if (cancelled) return;
        setEntries(result.entries);
        setPagination(result.pagination);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load leaderboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [period, isAuthenticated]);

  // Periodic revalidation — only while the user hasn't paginated further, so
  // "Load more" progress isn't silently discarded out from under them.
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (pageRef.current !== 1) return;
      fetchLeaderboard(period, 1, PAGE_LIMIT)
        .then((result) => {
          setEntries(result.entries);
          setPagination(result.pagination);
        })
        .catch(() => {
          // Silent — keep showing the last good data.
        });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [period, isAuthenticated]);

  const loadMore = async () => {
    if (!pagination || page >= pagination.pages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchLeaderboard(period, nextPage, PAGE_LIMIT);
      setEntries((prev) => [...prev, ...result.entries]);
      setPagination(result.pagination);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoadingMore(false);
    }
  };

  const periodTabs: { id: LeaderboardPeriod; label: string }[] = [
    { id: "daily", label: strings.leaderboard.daily },
    { id: "weekly", label: strings.leaderboard.weekly },
    { id: "all_time", label: strings.leaderboard.allTime },
  ];

  const myEntry = currentUserId ? entries.find((e) => e.user?.id === currentUserId) : undefined;
  const hasMore = !!pagination && page < pagination.pages;
  const weeklyPeriodEnd = period === "weekly" && entries.length > 0 ? entries[0].periodEnd : null;
  const drawCountdownLabel = useDrawCountdownLabel(weeklyPeriodEnd);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-text-secondary">{strings.leaderboard.signInGateBody}</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {strings.streak.signInButton}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {periodTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPeriod(tab.id)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              period === tab.id ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
        {weeklyPeriodEnd && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {strings.leaderboard.drawCountdown(drawCountdownLabel)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-400">{error}</p>
      ) : entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">{strings.leaderboard.empty}</p>
      ) : (
        <>
          <div className="mb-1 flex items-center px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            <div className="w-8 text-center">{strings.leaderboard.rank}</div>
            <div className="flex-1 pl-2">{strings.leaderboard.player}</div>
            <div className="w-14 text-center">{strings.leaderboard.points}</div>
          </div>
          <div className="grid gap-0.5">
            {entries.map((entry, i) => {
              const isMe = entry.user?.id === currentUserId;
              const isWeeklyChampion = period === "weekly" && entry.rank === 1;
              const avatarText = (entry.user.phone ?? entry.user.email ?? "??").slice(-2).toUpperCase();
              const playerLabel = getLeaderboardPlayerLabel(entry.user);

              return (
                <div
                  key={entry.id}
                  className={`flex items-center rounded-xl px-3 py-2.5 transition-colors ${
                    isMe
                      ? "border border-primary/40 bg-primary/10"
                      : isWeeklyChampion
                      ? "border border-amber-500/40 bg-amber-500/10"
                      : i % 2 === 0
                      ? "bg-card"
                      : "bg-transparent"
                  }`}
                >
                  <div className={`w-8 text-center text-xs font-bold ${isMe ? "text-primary" : "text-text-secondary"}`}>
                    {isWeeklyChampion ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-amber-500">
                        <path d={TROPHY_PATH} />
                      </svg>
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <div className="flex flex-1 min-w-0 items-center gap-2 pl-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card-hover text-[10px] font-bold text-text-secondary">
                      {avatarText}
                    </div>
                    <span className="truncate text-sm font-semibold text-text">{playerLabel}</span>
                  </div>
                  <div className={`w-14 text-center text-sm font-black ${isMe ? "text-primary" : "text-text"}`}>
                    {entry.points}
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text transition-colors hover:bg-card-hover disabled:opacity-60"
              >
                {loadingMore ? strings.common.loading : strings.leaderboard.loadMore}
              </button>
            </div>
          )}

          {currentUserId && (
            <div className="sticky bottom-20 mt-4 flex items-center justify-between rounded-xl border border-primary/40 bg-card px-4 py-2.5 shadow-lg md:bottom-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                {strings.leaderboard.player}
              </span>
              <span className="text-sm font-black text-primary">
                {myEntry ? strings.leaderboard.you(myEntry.rank) : strings.leaderboard.youUnranked}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
