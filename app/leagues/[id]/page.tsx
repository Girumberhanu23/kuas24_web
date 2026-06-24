"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import FixtureCard from "../../components/FixtureCard";
import type { Fixture, StandingRow, StandingsResponse } from "../../lib/types";

type StatusFilter = "all" | "live" | "upcoming" | "finished";

// World Cup league ID on API-Football is 1
const WORLD_CUP_IDS = ["1"];

function pad2(n: number) { return String(n).padStart(2, "0"); }

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, tomorrow)) return "Tomorrow";
  if (isSameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

function fixtureDay(f: Fixture) {
  const src = f.date ?? "";
  const d = new Date(src);
  if (isNaN(d.getTime())) return "Unknown";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// ── Inline date picker (horizontal scroll strip + optional month calendar) ──
function DatePicker({
  selected,
  onChange,
}: {
  selected: Date | null;
  onChange: (d: Date | null) => void;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date());

  // Generate ±45 days around today for the strip
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  }, []);

  const stripDays = useMemo(() => {
    return Array.from({ length: 91 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - 45 + i); return d;
    });
  }, [today]);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const selectedStr = selected ? fmt(selected) : null;

  // Calendar helpers
  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const firstDay = new Date(calYear, calMonthIdx, 1).getDay();
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();

  const calDays: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(calYear, calMonthIdx, i + 1)),
  ];

  return (
    <div className="mb-6">
      {/* Strip + calendar toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onChange(null)}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            !selected ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
          }`}
        >
          All dates
        </button>
        <div className="hide-scrollbar flex gap-1.5 overflow-x-auto flex-1"
          ref={(el) => {
            // Auto-scroll to today on mount
            if (el && !el.dataset.scrolled) {
              const todayBtn = el.querySelector("[data-today]") as HTMLElement | null;
              if (todayBtn) {
                el.scrollLeft = todayBtn.offsetLeft - el.clientWidth / 2 + todayBtn.clientWidth / 2;
                el.dataset.scrolled = "1";
              }
            }
          }}
        >
          {stripDays.map((d) => {
            const isToday = fmt(d) === fmt(today);
            const isSel = fmt(d) === selectedStr;
            return (
              <button
                key={fmt(d)}
                data-today={isToday ? "1" : undefined}
                onClick={() => onChange(new Date(d))}
                className={`flex flex-shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 transition-all ${
                  isSel
                    ? "bg-primary text-white"
                    : isToday
                    ? "bg-primary/15 text-primary"
                    : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
                }`}
              >
                <span className="text-[9px] font-medium uppercase">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-sm font-bold leading-tight">{d.getDate()}</span>
                <span className="text-[9px]">
                  {d.toLocaleDateString("en-US", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
        {/* Calendar icon to open full month picker */}
        <button
          onClick={() => setShowCalendar((v) => !v)}
          className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
            showCalendar ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
          }`}
          title="Open calendar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </button>
      </div>

      {/* Full month calendar */}
      {showCalendar && (
        <div className="rounded-xl border border-border bg-card p-4 mt-2">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-card-hover text-text-secondary hover:text-text"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-text">
              {calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-card-hover text-text-secondary hover:text-text"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-text-secondary py-1">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {calDays.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const isToday = fmt(d) === fmt(today);
              const isSel = fmt(d) === selectedStr;
              return (
                <button
                  key={fmt(d)}
                  onClick={() => { onChange(new Date(d)); setShowCalendar(false); }}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                    isSel
                      ? "bg-primary text-white font-bold"
                      : isToday
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-text hover:bg-card-hover"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── World Cup Group Table ─────────────────────────────────────────────────────
function WorldCupGroups({ leagueId, season }: { leagueId: string; season: string }) {
  const [groups, setGroups] = useState<StandingRow[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/standings?league=${leagueId}&season=${season}`);
        if (!res.ok) throw new Error("Groups unavailable");
        const json = await res.json() as StandingsResponse;
        if (!cancelled) setGroups(json.groups ?? (json.standings ? [json.standings] : null));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [leagueId, season]);

  if (loading) return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="h-4 w-32 animate-pulse rounded bg-card-hover mb-3" />
      <div className="grid gap-2">
        {[1,2,3,4].map(i => <div key={i} className="h-8 animate-pulse rounded bg-card-hover" />)}
      </div>
    </div>
  );
  if (error || !groups?.length) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Group Stage</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group, gi) => {
          const groupName = (group[0] as any)?.group ?? `Group ${String.fromCharCode(65 + gi)}`;
          return (
            <div key={gi} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-primary/10 px-3 py-2 flex items-center gap-2">
                <div className="h-3 w-1 rounded-full bg-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{groupName}</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-1.5 pl-3 text-left font-semibold text-text-secondary w-6">#</th>
                    <th className="py-1.5 pl-2 text-left font-semibold text-text-secondary">Team</th>
                    <th className="py-1.5 px-2 text-center font-semibold text-text-secondary">P</th>
                    <th className="py-1.5 px-2 text-center font-semibold text-text-secondary">W</th>
                    <th className="py-1.5 px-2 text-center font-semibold text-text-secondary">D</th>
                    <th className="py-1.5 px-2 text-center font-semibold text-text-secondary">L</th>
                    <th className="py-1.5 px-2 text-center font-semibold text-text-secondary">GD</th>
                    <th className="py-1.5 pr-3 text-center font-bold text-text-secondary">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((row, ri) => (
                    <tr key={row.team.id} className={`border-b border-border/50 last:border-0 ${ri < 2 ? "bg-primary/5" : ""}`}>
                      <td className="py-2 pl-3 font-semibold text-text-secondary">{row.rank}</td>
                      <td className="py-2 pl-2">
                        <div className="flex items-center gap-1.5">
                          {row.team.logo && <img src={row.team.logo} alt="" className="h-4 w-4 object-contain" />}
                          <span className="font-medium text-text truncate max-w-[80px]">{row.team.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-text-secondary">{row.all.played}</td>
                      <td className="py-2 px-2 text-center text-text-secondary">{row.all.win}</td>
                      <td className="py-2 px-2 text-center text-text-secondary">{row.all.draw}</td>
                      <td className="py-2 px-2 text-center text-text-secondary">{row.all.lose}</td>
                      <td className="py-2 px-2 text-center text-text-secondary">{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</td>
                      <td className="py-2 pr-3 text-center font-bold text-text">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-text-secondary pl-1">Top 2 teams in each group (highlighted) advance.</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const leagueName = searchParams.get("name") ?? "League";
  const leagueLogo = searchParams.get("logo") ?? "";
  const isWorldCup = WORLD_CUP_IDS.includes(id);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ league: id, season: "2026" });
        const res = await fetch(`/api/fixtures?${params}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `HTTP ${res.status}`);
        }
        const json = await res.json() as { fixtures: Fixture[] };
        const sorted = (json.fixtures ?? []).sort((a, b) => {
          const order = { live: 0, upcoming: 1, finished: 2 };
          const diff = order[a.status] - order[b.status];
          if (diff !== 0) return diff;
          if (a.status === "upcoming") return (a.date ?? "").localeCompare(b.date ?? "");
          return (b.date ?? "").localeCompare(a.date ?? "");
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

  const filtered = useMemo(() => {
    return fixtures.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (selectedDate) {
        const pad2 = (n: number) => String(n).padStart(2, "0");
        const fmt = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
        if (fixtureDay(f) !== fmt(selectedDate)) return false;
      }
      return true;
    });
  }, [fixtures, statusFilter, selectedDate]);

  // Group by day
  const groupedByDay = useMemo(() => {
    const map: Record<string, Fixture[]> = {};
    for (const f of filtered) {
      const day = fixtureDay(f);
      if (!map[day]) map[day] = [];
      map[day].push(f);
    }
    return map;
  }, [filtered]);

  const sortedDays = useMemo(() =>
    Object.keys(groupedByDay).sort((a, b) => {
      // live fixtures (day "Unknown") always first
      if (a === "Unknown") return -1;
      if (b === "Unknown") return 1;
      return a.localeCompare(b);
    }),
    [groupedByDay]
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
      {/* Back + header */}
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
            <img src={leagueLogo} alt={leagueName} className="h-12 w-12 object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          )}
          <div>
            <h1 className="text-2xl font-bold text-text">{leagueName}</h1>
            <p className="text-sm text-text-secondary">
              {loading ? "Loading…" : `${counts.all} matches`}
            </p>
          </div>
        </div>
      </div>

      {/* World Cup group tables */}
      {isWorldCup && <WorldCupGroups leagueId={id} season="2026" />}

      {/* Status Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
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
            <span className="rounded bg-bg px-1.5 py-0.5 text-[10px]">{counts[tab.id]}</span>
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <DatePicker selected={selectedDate} onChange={setSelectedDate} />

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
      ) : sortedDays.length > 0 ? (
        <div className="grid gap-8">
          {sortedDays.map((day) => {
            const dayFixtures = groupedByDay[day];
            const liveCount = dayFixtures.filter((f) => f.status === "live").length;
            return (
              <div key={day}>
                {/* Date section header */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {liveCount > 0 && (
                      <span className="inline-block h-2 w-2 rounded-full bg-live live-pulse" />
                    )}
                    <span className="text-sm font-bold text-text">
                      {day === "Unknown" ? "Live Now" : formatDateLabel(day + "T00:00:00")}
                    </span>
                  </div>
                  {day !== "Unknown" && (
                    <span className="text-xs text-text-secondary">
                      {new Date(day + "T00:00:00").toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  )}
                  <div className="flex-1 border-t border-border/60" />
                  <span className="text-xs text-text-secondary">{dayFixtures.length} match{dayFixtures.length !== 1 ? "es" : ""}</span>
                </div>
                <div className="grid gap-2">
                  {dayFixtures.map((fixture) => (
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
          <p className="text-sm text-text-secondary">
            No {statusFilter !== "all" ? statusFilter + " " : ""}matches{selectedDate ? " on this date" : ""}
          </p>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="mt-3 text-xs text-primary hover:underline">
              Clear date filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
