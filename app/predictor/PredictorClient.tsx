"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../lib/use-auth";
import { usePredictorStrings } from "../lib/predictor-strings";
import {
  fetchMyPredictions,
  fetchMyStreak,
  fetchPredictorFixtures,
  submitPrediction,
} from "../lib/predictor";
import DateRangePicker from "../components/DateRangePicker";
import type {
  PredictorFixture,
  PredictorPick,
  PredictorPrediction,
  PredictorPagination,
  StreakSummary,
} from "../lib/predictor-types";
import PredictorStreakCard from "../components/PredictorStreakCard";
import PredictorFixtureCard from "../components/PredictorFixtureCard";
import PredictorLeaderboard from "../components/PredictorLeaderboard";
import LocaleToggle from "../components/LocaleToggle";

const POLL_INTERVAL_MS = 60_000;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toYYYYMMDD(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function sortFixturesByKickoff(fixtures: PredictorFixture[]): PredictorFixture[] {
  return [...fixtures].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

const TROPHY_PATH =
  "M6 3h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6V3Z M6 5H4a2 2 0 0 0 2 3 M18 5h2a2 2 0 0 1-2 3 M12 13v4 M9 21h6 M10 21v-2a2 2 0 0 1 4 0v2";

const TABS = ["upcoming", "history", "leaderboard"] as const;
type Tab = (typeof TABS)[number];

function SignInGate({ body, buttonLabel }: { body: string; buttonLabel: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <p className="text-sm text-text-secondary">{body}</p>
      <Link
        href="/login"
        className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 text-text-secondary">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}

type HistoryFilter = "all" | "correct" | "incorrect" | "pending";

function predictionOutcome(prediction: PredictorPrediction): "correct" | "incorrect" | "pending" {
  const fixture = typeof prediction.fixture === "string" ? null : prediction.fixture;
  if (!fixture || !prediction.resolvedAt || fixture.resolvedResult === null) return "pending";
  return fixture.resolvedResult === prediction.pick ? "correct" : "incorrect";
}

function PredictionHistoryTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const strings = usePredictorStrings();
  const [predictions, setPredictions] = useState<PredictorPrediction[]>([]);
  const [pagination, setPagination] = useState<PredictorPagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>("all");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchMyPredictions(1, 20);
        if (cancelled) return;
        setPredictions(result.predictions);
        setPagination(result.pagination);
        setPage(1);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load predictions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const loadMore = async () => {
    if (!pagination || page >= pagination.pages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchMyPredictions(nextPage, 20);
      setPredictions((prev) => [...prev, ...result.predictions]);
      setPagination(result.pagination);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load predictions");
    } finally {
      setLoadingMore(false);
    }
  };

  if (!isAuthenticated) {
    return <SignInGate body={strings.history.signInBody} buttonLabel={strings.streak.signInButton} />;
  }

  const filterTabs: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: strings.history.filterAll },
    { id: "correct", label: strings.history.filterCorrect },
    { id: "incorrect", label: strings.history.filterIncorrect },
    { id: "pending", label: strings.history.filterPending },
  ];

  const filtered = predictions.filter((p) => filter === "all" || predictionOutcome(p) === filter);
  const hasMore = !!pagination && page < pagination.pages;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) return <p className="py-8 text-center text-sm text-red-400">{error}</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filter === tab.id ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={strings.history.empty} />
      ) : (
        <div className="grid gap-2">
          {filtered.map((prediction) => {
            const fixture = typeof prediction.fixture === "string" ? null : prediction.fixture;
            const outcome = predictionOutcome(prediction);
            const badgeClass =
              outcome === "correct"
                ? "bg-goal/10 text-goal"
                : outcome === "incorrect"
                ? "bg-live/10 text-live"
                : "bg-card-hover text-text-secondary";
            const badgeLabel =
              outcome === "correct"
                ? strings.history.correct
                : outcome === "incorrect"
                ? strings.history.incorrect
                : strings.history.pending;

            return (
              <div key={prediction.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {fixture ? `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}` : "—"}
                    </p>
                    {fixture && (
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {fixture.homeScore !== null && fixture.awayScore !== null
                          ? `${fixture.homeScore} - ${fixture.awayScore}`
                          : new Date(fixture.kickoff).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                            })}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {prediction.pointsAwarded !== null && (
                      <span className="text-xs font-bold text-primary">
                        {strings.history.pointsEarned(prediction.pointsAwarded)}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeClass}`}>{badgeLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}

export default function PredictorPage() {
  const { isAuthenticated, user } = useAuth();
  const strings = usePredictorStrings();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [fixtures, setFixtures] = useState<PredictorFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [fixturesError, setFixturesError] = useState<string | null>(null);

  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [submittingFixtureId, setSubmittingFixtureId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function load(isInitial: boolean) {
      try {
        const fixtures = await fetchPredictorFixtures({ date: toYYYYMMDD(selectedDate) });
        if (cancelled) return;
        setFixtures(sortFixturesByKickoff(fixtures));
        setFixturesError(null);
      } catch (e) {
        if (!cancelled) setFixturesError(e instanceof Error ? e.message : "Failed to load fixtures");
      }

      if (isAuthenticated) {
        try {
          const sk = await fetchMyStreak();
          if (cancelled) return;
          setStreak(sk);
        } catch {
          if (!cancelled) setStreak(null);
        }
      } else {
        setStreak(null);
      }

      if (!cancelled && isInitial) {
        setFixturesLoading(false);
        setStreakLoading(false);
      }
    }

    setFixturesLoading(true);
    setStreakLoading(true);
    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, selectedDate]);

  const showToastError = (message: string) => {
    toast.error(message);
  };

  const handleNeedLogin = () => {
    const currentPath = pathname ?? "/predictor";
    const search = searchParams.toString();
    const redirectTarget = `${currentPath}${search ? `?${search}` : ""}`;
    toast.error("Please login to Predict a match");
    router.push(`/login?next=${encodeURIComponent(redirectTarget)}`);
  };

  const resolvePredictorFixtureId = async (fixtureId: string) => {
    if (!/^[0-9]+$/.test(fixtureId)) return fixtureId;

    const backendFixtures = await fetchPredictorFixtures({ date: toYYYYMMDD(selectedDate) });
    const matched = backendFixtures.find(
      (fixture) => String(fixture.apiFootballId) === fixtureId
    );

    if (!matched) {
      throw new Error(
        "Unable to resolve this fixture for prediction. Please refresh the page and try again."
      );
    }

    return matched.id;
  };

  const handlePick = async (fixtureId: string, pick: PredictorPick) => {
    if (!isAuthenticated) {
      handleNeedLogin();
      return;
    }

    const snapshot = fixtures;
    setFixtures((prev) =>
      prev.map((f) => (f.id === fixtureId ? { ...f, userPick: pick, alreadyPicked: true } : f))
    );
    setSubmittingFixtureId(fixtureId);

    try {
      const resolvedFixtureId = await resolvePredictorFixtureId(fixtureId);
      await submitPrediction(resolvedFixtureId, pick);
    } catch (e) {
      setFixtures(snapshot);
      showToastError(e instanceof Error ? e.message : strings.fixtures.submitError);
    } finally {
      setSubmittingFixtureId(null);
    }
  };

  const tabLabels: Record<Tab, string> = {
    upcoming: strings.tabs.upcoming,
    history: strings.tabs.myPredictions,
    leaderboard: strings.tabs.leaderboard,
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredFixtures = useMemo(() => {
    if (!normalizedSearch) return fixtures;
    return fixtures.filter((fixture) => {
      const term = [fixture.homeTeam.name, fixture.awayTeam.name, fixture.league.name]
        .join(" ")
        .toLowerCase();
      return term.includes(normalizedSearch);
    });
  }, [fixtures, normalizedSearch]);

  const groupedByLeague = useMemo(() => {
    const m: Record<string, PredictorFixture[]> = {};
    for (const f of filteredFixtures) {
      const key = f.league?.name ?? "League";
      if (!m[key]) m[key] = [];
      m[key].push(f);
    }
    return m;
  }, [filteredFixtures]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-text">{strings.pageTitle}</h1>
          <p className="text-sm text-text-secondary">{strings.pageSubtitle}</p>
        </div>
        <LocaleToggle />
      </div>

      <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500">
          <path d={TROPHY_PATH} />
        </svg>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{strings.prizeBanner}</p>
      </div>

      <div className="mb-6">
        <PredictorStreakCard
          isAuthenticated={isAuthenticated}
          streak={streak}
          loading={streakLoading}
          onRestored={setStreak}
        />
      </div>

      <div className="hide-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-border/40 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative shrink-0 px-4 pb-3 pt-1 text-sm font-bold transition-colors ${
              activeTab === tab ? "text-primary" : "text-text-secondary hover:text-text"
            }`}
          >
            {tabLabels[tab]}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />}
          </button>
        ))}
      </div>

      {activeTab === "upcoming" && (
        <div>
          <div className="mb-4">
            <DateRangePicker
              selected={selectedDate}
              onChange={(date) => {
                if (date) setSelectedDate(date);
              }}
            />
          </div>
          <div className="mb-6 flex justify-end">
            <div className="w-full max-w-md rounded-3xl border border-border bg-surface px-4 py-3">
              <label htmlFor="predictor-search" className="sr-only">Search fixtures</label>
              <input
                id="predictor-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search team or league"
                className="w-full bg-transparent text-sm text-text placeholder:text-text-secondary focus:outline-none"
              />
            </div>
          </div>

          {fixturesLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : fixturesError ? (
            <p className="py-8 text-center text-sm text-red-400">{fixturesError}</p>
          ) : fixtures.length === 0 ? (
            <EmptyState message={strings.fixtures.empty} />
          ) : filteredFixtures.length === 0 ? (
            <EmptyState message="No fixtures match your search." />
          ) : (
            <div>
              <p className="mb-3 text-xs text-text-secondary">{strings.fixtures.windowNote}</p>
              <div className="grid gap-6">
                {Object.entries(groupedByLeague).map(([leagueName, leagueFixtures]) => (
                  <div key={leagueName}>
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">{leagueName}</h3>
                      <span className="rounded bg-card px-2 py-0.5 text-[10px] text-text-secondary">{leagueFixtures.length}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {leagueFixtures.map((fixture) => (
                        <PredictorFixtureCard
                          key={fixture.id}
                          fixture={fixture}
                          isAuthenticated={isAuthenticated}
                          isSubmitting={submittingFixtureId === fixture.id}
                          onPick={handlePick}
                          onNeedLogin={handleNeedLogin}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && <PredictionHistoryTab isAuthenticated={isAuthenticated} />}

      {activeTab === "leaderboard" && (
        <PredictorLeaderboard isAuthenticated={isAuthenticated} currentUserId={user?.id ?? null} />
      )}
    </div>
  );
}
