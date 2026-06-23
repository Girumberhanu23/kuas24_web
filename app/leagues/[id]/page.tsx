"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import FixtureCard from "../../components/FixtureCard";
import type { Fixture } from "../../lib/types";

type StatusFilter = "all" | "live" | "upcoming" | "finished";

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const leagueName = searchParams.get("name") ?? "League";
  const leagueLogo = searchParams.get("logo") ?? "";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all fixtures for this league (current season, no date filter = all rounds)
        const params = new URLSearchParams({ league: id, season: "2026" });
        const res = await fetch(`/api/fixtures?${params}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const json = await res.json() as { fixtures: Fixture[] };
        // Sort: live first, then upcoming by date, then finished (most recent first)
        const sorted = (json.fixtures ?? []).sort((a, b) => {
          const order = { live: 0, upcoming: 1, finished: 2 };
          const diff = order[a.status] - order[b.status];
          if (diff !== 0) return diff;
          if (a.status === "upcoming") return (a.date ?? "").localeCompare(b.date ?? "");
          return (b.date ?? "").localeCompare(a.date ?? ""); // finished: newest first
        });
        setFixtures(sorted);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load fixtures");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const filtered = useMemo(() =>
    statusFilter === "all" ? fixtures : fixtures.filter((f) => f.status === statusFilter),
    [fixtures, statusFilter]
  );

  const counts = useMemo(() => ({
    all: fixtures.length,
    live: fixtures.filter((f) => f.status === "live").length,
    upcoming: fixtures.filter((f) => f.status === "upcoming").length,
    finished: fixtures.filter((f) => f.status === "finished").length,
  }), [fixtures]);

  const statusTabs: { id: StatusFilter; label: string; color: string }[] = [
    { id: "all",      label: "All",      color: "text-text" },
    { id: "live",     label: "Live",     color: "text-live" },
    { id: "upcoming", label: "Upcoming", color: "text-primary" },
    { id: "finished", label: "Finished", color: "text-text-secondary" },
  ];

  return (
    <div>
      {/* Back button + header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-3">
          {leagueLogo && (
            <img
              src={leagueLogo}
              alt={leagueName}
              className="h-10 w-10 object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-text">{leagueName}</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${counts.all} matches`}
            </p>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === tab.id
                ? `bg-card border border-primary/30 ${tab.color}`
                : "text-text-secondary hover:bg-card hover:text-text"
            }`}
          >
            {tab.label}
            {tab.id === "live" && counts.live > 0 && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-live live-pulse" />
            )}
            <span className="rounded bg-bg px-1.5 py-0.5 text-[10px]">
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Fixtures */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading matches…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-2">
          {filtered.map((fixture) => (
            <FixtureCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 text-text-secondary">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <p className="text-sm text-text-secondary">No {statusFilter === "all" ? "" : statusFilter + " "}matches found</p>
        </div>
      )}
    </div>
  );
}
