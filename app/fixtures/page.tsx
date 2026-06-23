"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FixtureCard from "../components/FixtureCard";
import type { Fixture, LeagueCategory } from "../lib/types";

type StatusFilter = "all" | "live" | "upcoming" | "finished";

const LEAGUES_CACHE_KEY = "kuas24_leagues_v2";
const LEAGUES_CACHE_TTL = 24 * 60 * 60 * 1000;

interface LeaguesCache {
  timestamp: number;
  leagues: LeagueCategory[];
}

function pad2(n: number) { return String(n).padStart(2, "0"); }
function toYYYYMMDD(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getCachedLeagues(): LeagueCategory[] | null {
  try {
    const raw = sessionStorage.getItem(LEAGUES_CACHE_KEY);
    if (!raw) return null;
    const parsed: LeaguesCache = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > LEAGUES_CACHE_TTL) {
      sessionStorage.removeItem(LEAGUES_CACHE_KEY);
      return null;
    }
    return parsed.leagues;
  } catch { return null; }
}

function setCachedLeagues(leagues: LeagueCategory[]) {
  try {
    sessionStorage.setItem(LEAGUES_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), leagues }));
  } catch {}
}

export default function FixturesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(2026);
    return d;
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date>(baseDate);

  // ── Leagues ──────────────────────────────────────────────────────
  const [leagues, setLeagues] = useState<LeagueCategory[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);

  useEffect(() => {
    const cached = getCachedLeagues();
    if (cached && cached.length > 1) {
      setLeagues(cached);
      setLeaguesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/leagues");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json() as {
          leagues: { id: string; name: string; logo: string; country: string }[];
        };
        if (cancelled) return;
        const categories: LeagueCategory[] = [
          { id: "all", name: "All" },
          ...json.leagues.map((l) => ({ id: l.id, name: l.name, logo: l.logo })),
        ];
        setLeagues(categories);
        setCachedLeagues(categories);
      } catch {
        if (!cancelled) setLeagues([{ id: "all", name: "All" }]);
      } finally {
        if (!cancelled) setLeaguesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Selected league (default to first real league once loaded) ────
  const [selectedLeagueId, setSelectedLeagueId] = useState("all");

  // ── Fixtures ─────────────────────────────────────────────────────
  const [apiFixtures, setApiFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ season: "2026", date: toYYYYMMDD(selectedDate) });
        if (selectedLeagueId !== "all") params.set("league", selectedLeagueId);
        const res = await fetch(`/api/fixtures?${params}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const json = await res.json() as { fixtures: Fixture[] };
        setApiFixtures(json.fixtures ?? []);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load fixtures");
        setApiFixtures([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [selectedDate, selectedLeagueId]);

  // ── Filter & group ────────────────────────────────────────────────
  const filtered = useMemo(() =>
    apiFixtures.filter((f) => statusFilter === "all" || f.status === statusFilter),
    [apiFixtures, statusFilter]
  );

  const grouped = filtered.reduce((acc, f) => {
    const key = f.leagueId ?? f.league;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {} as Record<string, Fixture[]>);

  const statusTabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "upcoming", label: "Upcoming" },
    { id: "finished", label: "Finished" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-text">Fixtures</h1>
        <p className="text-sm text-text-secondary">Live scores, upcoming matches, and results</p>
      </div>

      {/* League Filter */}
      <div className="mb-4 relative">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          {leaguesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-28 flex-shrink-0 animate-pulse rounded-full bg-card" />
              ))
            : leagues.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedLeagueId(cat.id)}
                  className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedLeagueId === cat.id
                      ? "bg-primary text-white"
                      : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
                  }`}
                >
                  {cat.logo && (
                    <img src={cat.logo} alt="" className="h-4 w-4 object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  )}
                  {cat.name}
                </button>
              ))}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent" />
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === tab.id
                ? "bg-card border border-primary/30 text-text"
                : "text-text-secondary hover:bg-card hover:text-text"
            }`}
          >
            {tab.label}
            {tab.id === "live" && (
              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-live live-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Date Bar */}
      <div className="mb-6 hide-scrollbar flex gap-2 overflow-x-auto">
        {[-2, -1, 0, 1, 2, 3, 4].map((offset) => {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + offset);
          const isSelected = toYYYYMMDD(date) === toYYYYMMDD(selectedDate);
          return (
            <button
              key={offset}
              onClick={() => setSelectedDate(new Date(date))}
              className={`flex flex-shrink-0 flex-col items-center rounded-lg px-4 py-2 transition-all ${
                isSelected ? "bg-primary text-white" : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
              }`}
            >
              <span className="text-[10px] font-medium uppercase">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-sm font-bold">
                {date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fixtures */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading fixtures…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="grid gap-6">
          {Object.entries(grouped).map(([key, leagueFixtures]) => {
            const first = leagueFixtures[0];
            return (
              <div key={key}>
                <Link
                  href={`/leagues/${first.leagueId ?? key}?name=${encodeURIComponent(first.league)}&logo=${encodeURIComponent(first.leagueLogo ?? "")}`}
                  className="mb-3 flex items-center gap-2 group"
                >
                  <div className="h-5 w-1 rounded-full bg-primary" />
                  {first.leagueLogo && (
                    <img src={first.leagueLogo} alt="" className="h-5 w-5 object-contain" />
                  )}
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary group-hover:text-primary transition-colors">
                    {first.league}
                  </h3>
                  <span className="rounded bg-card px-1.5 py-0.5 text-[10px] text-text-secondary">
                    {leagueFixtures.length}
                  </span>
                  <svg className="ml-auto h-4 w-4 text-text-secondary group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
                <div className="grid gap-2">
                  {leagueFixtures.map((fixture) => (
                    <FixtureCard key={fixture.id} fixture={fixture} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 text-text-secondary">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <p className="text-sm text-text-secondary">No fixtures found for this date</p>
        </div>
      )}
    </div>
  );
}
