"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "../../lib/locale";
import { getLocalizedLeagueName } from "../../lib/leagues";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MatchData {
  id: string;
  date: string;
  status: "live" | "finished" | "upcoming";
  minute?: string;
  league: string;
  leagueLogo?: string;
  leagueId?: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
}

interface StandingRow {
  rank: number;
  group?: string;
  team: { id: number; name: string; logo?: string };
  points: number;
  goalsDiff: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

interface RoundFixture {
  id: string;
  date: string;
  status: "live" | "finished" | "upcoming";
  minute?: string;
  home: { name: string; logo?: string; score: number | null };
  away: { name: string; logo?: string; score: number | null };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WORLD_CUP_ID = "1";
const ALL_TABS = ["Fixtures", "Results", "Standings", "Draw", "Players", "Teams"] as const;
const BASE_TABS = ["Fixtures", "Results", "Standings"] as const;
type Tab = typeof ALL_TABS[number];

function pad2(n: number) { return String(n).padStart(2, "0"); }
function toYYYYMMDD(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }

function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, tomorrow)) return "Tomorrow";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function groupByDay(matches: MatchData[]) {
  const m: Record<string, MatchData[]> = {};
  for (const match of matches) {
    const key = match.date.split("T")[0];
    if (!m[key]) m[key] = [];
    m[key].push(match);
  }
  return m;
}

// ─── Date Picker ──────────────────────────────────────────────────────────────
function DatePicker({ selected, onChange }: { selected: Date | null; onChange: (d: Date | null) => void }) {
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const fmt = (d: Date) => toYYYYMMDD(d);
  const selectedStr = selected ? fmt(selected) : null;

  const stripDays = useMemo(() =>
    Array.from({ length: 91 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - 45 + i); return d;
    }), [today]);

  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const firstDay = new Date(calYear, calMonthIdx, 1).getDay();
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  const calDays: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(calYear, calMonthIdx, i + 1)),
  ];

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(null)}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            !selected ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
          }`}
        >All dates</button>
        <div
          className="hide-scrollbar flex gap-1.5 overflow-x-auto flex-1"
          ref={el => {
            if (el && !el.dataset.scrolled) {
              const todayBtn = el.querySelector("[data-today]") as HTMLElement | null;
              if (todayBtn) { el.scrollLeft = todayBtn.offsetLeft - el.clientWidth / 2 + todayBtn.clientWidth / 2; el.dataset.scrolled = "1"; }
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
                className={`flex flex-shrink-0 flex-col items-center rounded-xl px-2.5 py-1.5 transition-all ${
                  isSel ? "bg-primary text-white"
                  : isToday ? "bg-primary/10 text-primary ring-1 ring-primary/40"
                  : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
                }`}
              >
                <span className="text-[9px] font-bold uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                <span className="text-sm font-bold">{d.getDate()}</span>
                <span className="text-[9px]">{d.toLocaleDateString("en-US", { month: "short" })}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowCal(v => !v)}
          className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
            showCal ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
          }`}
          title="Open calendar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
        </button>
      </div>

      {showCal && (
        <div className="mt-2 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-card-hover text-text-secondary hover:text-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-bold text-text">{calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-card-hover text-text-secondary hover:text-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-text-secondary py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {calDays.map((d, i) => {
              if (!d) return <div key={`e-${i}`}/>;
              const isSel = fmt(d) === selectedStr;
              const isToday = fmt(d) === fmt(today);
              return (
                <button key={fmt(d)} onClick={() => { onChange(new Date(d)); setShowCal(false); }}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                    isSel ? "bg-primary text-white font-bold"
                    : isToday ? "bg-primary/10 text-primary font-bold"
                    : "text-text hover:bg-card-hover"
                  }`}
                >{d.getDate()}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ match }: { match: MatchData }) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const hasScore = isLive || isFinished;

  return (
    <Link href={`/fixtures/${match.id}`} className="block">
      <div className="rounded-2xl bg-card px-4 py-3.5 transition-all hover:bg-card-hover">
        <div className="flex items-center gap-3">
          {/* Time/status */}
          <div className="w-12 flex-shrink-0 text-center">
            {isLive ? (
              <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-black text-live bg-live/10">{match.minute ?? "LIVE"}</span>
            ) : (
              <span className={`text-xs font-semibold ${isFinished ? "text-text-secondary" : "text-text-secondary"}`}>
                {isFinished ? "FT" : match.time}
              </span>
            )}
          </div>
          {/* Teams + score */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {match.homeTeamLogo && <img src={match.homeTeamLogo} alt="" className="h-5 w-5 object-contain flex-shrink-0" onError={e => (e.currentTarget.style.display="none")}/>}
                <span className={`text-sm font-semibold truncate ${hasScore && (match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-text" : "text-text-secondary"}`}>
                  {match.homeTeam}
                </span>
              </div>
              {hasScore && <span className={`text-sm font-black ml-2 ${(match.homeScore ?? 0) > (match.awayScore ?? 0) ? "text-text" : "text-text-secondary"}`}>{match.homeScore}</span>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {match.awayTeamLogo && <img src={match.awayTeamLogo} alt="" className="h-5 w-5 object-contain flex-shrink-0" onError={e => (e.currentTarget.style.display="none")}/>}
                <span className={`text-sm font-semibold truncate ${hasScore && (match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-text" : "text-text-secondary"}`}>
                  {match.awayTeam}
                </span>
              </div>
              {hasScore && <span className={`text-sm font-black ml-2 ${(match.awayScore ?? 0) > (match.homeScore ?? 0) ? "text-text" : "text-text-secondary"}`}>{match.awayScore}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Fixtures/Results Tab ────────────────────────────────────────────────────
function MatchListTab({ matches, loading, emptyMsg }: { matches: MatchData[]; loading: boolean; emptyMsg: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filtered = useMemo(() => {
    if (!selectedDate) return matches;
    const sel = toYYYYMMDD(selectedDate);
    return matches.filter(m => m.date.startsWith(sel));
  }, [matches, selectedDate]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const days = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  if (loading) return (
    <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>
  );

  return (
    <div>
      <DatePicker selected={selectedDate} onChange={setSelectedDate} />
      {days.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 text-text-secondary">
            <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <p className="text-sm text-text-secondary">{selectedDate ? "No matches on this date" : emptyMsg}</p>
          {selectedDate && <button onClick={() => setSelectedDate(null)} className="mt-3 text-xs text-primary hover:underline">Show all dates</button>}
        </div>
      ) : (
        <div className="grid gap-6">
          {days.map(day => (
            <div key={day}>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{formatDayLabel(day + "T00:00:00")}</span>
                <div className="flex-1 border-t border-border/40"/>
                <span className="text-xs text-text-secondary">{grouped[day].length} match{grouped[day].length !== 1 ? "es" : ""}</span>
              </div>
              <div className="grid gap-2">
                {grouped[day].map(m => <MatchCard key={m.id} match={m}/>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Standings Tab ───────────────────────────────────────────────────────────
function StandingsTab({ leagueId, season, isWorldCup }: { leagueId: string; season: string; isWorldCup: boolean }) {
  const [groups, setGroups] = useState<StandingRow[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/standings?league=${leagueId}&season=${season}`);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) setGroups(json.groups ?? (json.standings ? [json.standings] : []));
      } catch { if (!cancelled) setError("Standings unavailable"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [leagueId, season]);

  if (loading) return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>;
  if (error) return <p className="py-8 text-center text-sm text-text-secondary">{error}</p>;
  if (!groups.length) return <p className="py-8 text-center text-sm text-text-secondary">No standings available</p>;

  return (
    <div className="grid gap-8">
      {groups.map((group, gi) => {
        const groupName = (group[0] as any)?.group ?? (groups.length > 1 ? `Group ${String.fromCharCode(65 + gi)}` : "");
        return (
          <div key={gi}>
            {groupName && (
              <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-primary">{groupName}</h3>
            )}
            {/* Header */}
            <div className="mb-1 flex items-center px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              <div className="w-6 text-center">#</div>
              <div className="flex-1 pl-7">Team</div>
              {["MP","W","D","L","GD","Pts"].map(h => (
                <div key={h} className="w-8 text-center">{h}</div>
              ))}
            </div>
            {/* Rows */}
            <div className="grid gap-0.5">
              {group.map((row, ri) => {
                const advances = isWorldCup && ri < 2;
                return (
                  <div
                    key={row.team.id}
                    className={`flex items-center rounded-xl px-3 py-2.5 transition-colors ${
                      advances ? "bg-primary/6" : ri % 2 === 0 ? "bg-card" : "bg-transparent"
                    }`}
                  >
                    {/* Advance bar */}
                    <div className={`mr-2 h-5 w-0.5 rounded-full flex-shrink-0 ${advances ? "bg-primary" : "bg-transparent"}`}/>
                    {/* Rank */}
                    <div className={`w-5 text-center text-xs font-bold flex-shrink-0 ${advances ? "text-primary" : "text-text-secondary"}`}>{row.rank}</div>
                    {/* Logo + Name */}
                    <div className="flex flex-1 min-w-0 items-center gap-2 pl-2">
                      {row.team.logo && <img src={row.team.logo} alt="" className="h-5 w-5 flex-shrink-0 object-contain" onError={e=>(e.currentTarget.style.display="none")}/>}
                      <span className="truncate text-sm font-semibold text-text">{row.team.name}</span>
                    </div>
                    {/* Stats */}
                    {[row.all.played, row.all.win, row.all.draw, row.all.lose, row.goalsDiff, row.points].map((v, vi) => (
                      <div key={vi} className={`w-8 text-center text-xs ${vi === 5 ? "font-black text-text" : "font-medium text-text-secondary"}`}>
                        {vi === 4 ? (v > 0 ? `+${v}` : `${v}`) : v}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            {isWorldCup && groups.length > 1 && (
              <div className="mt-2 flex items-center gap-1.5 pl-3">
                <div className="h-3 w-0.5 rounded-full bg-primary"/>
                <span className="text-[10px] text-text-secondary">Top 2 advance to Round of 16</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Draw Tab ────────────────────────────────────────────────────────────────
function DrawTab({ leagueId, season }: { leagueId: string; season: string }) {
  const [rounds, setRounds] = useState<string[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [fixtures, setFixtures] = useState<RoundFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/fixture-rounds?league=${leagueId}&season=${season}`);
        const json = await res.json();
        const r: string[] = json.rounds ?? [];
        setRounds(r);
        if (r.length) { setSelectedRound(r[0]); }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [leagueId, season]);

  useEffect(() => {
    if (!selectedRound) return;
    let cancelled = false;
    setFixturesLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/fixture-rounds?league=${leagueId}&season=${season}&round=${encodeURIComponent(selectedRound)}`);
        const json = await res.json();
        if (!cancelled) setFixtures(json.fixtures ?? []);
      } catch {}
      finally { if (!cancelled) setFixturesLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [selectedRound, leagueId, season]);

  if (loading) return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>;
  if (!rounds.length) return <p className="py-8 text-center text-sm text-text-secondary">Draw not available yet</p>;

  return (
    <div>
      {/* Round pills */}
      <div className="hide-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {rounds.map(r => (
          <button key={r} onClick={() => setSelectedRound(r)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              r === selectedRound ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
            }`}
          >{r}</button>
        ))}
      </div>

      {/* Bracket fixtures */}
      {fixturesLoading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {fixtures.map(f => {
            const isLive = f.status === "live";
            const isFinished = f.status === "finished";
            const hasScore = isLive || isFinished;
            const dt = new Date(f.date);
            const dateLabel = dt.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            const timeLabel = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={f.id} className="rounded-2xl bg-card p-5">
                <div className="mb-4 flex items-center justify-between text-xs text-text-secondary">
                  <span>{dateLabel} · {timeLabel}</span>
                  {isLive && <span className="rounded px-2 py-0.5 text-[10px] font-black bg-live/10 text-live">{f.minute ?? "LIVE"}</span>}
                  {isFinished && <span className="font-semibold">FT</span>}
                </div>
                <div className="flex items-center justify-between gap-3">
                  {/* Home */}
                  <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
                    {f.home.logo ? <img src={f.home.logo} alt="" className="h-12 w-12 object-contain drop-shadow-sm" onError={e=>(e.currentTarget.style.display="none")}/> : <div className="h-12 w-12"/>}
                    <span className="text-center text-xs font-bold text-text line-clamp-2">{f.home.name}</span>
                  </div>
                  {/* Score */}
                  <div className="flex flex-shrink-0 items-center gap-2 px-2">
                    <span className="text-3xl font-black tabular-nums text-text">{hasScore ? f.home.score ?? 0 : "—"}</span>
                    <span className="text-lg text-text-secondary">:</span>
                    <span className="text-3xl font-black tabular-nums text-text">{hasScore ? f.away.score ?? 0 : "—"}</span>
                  </div>
                  {/* Away */}
                  <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
                    {f.away.logo ? <img src={f.away.logo} alt="" className="h-12 w-12 object-contain drop-shadow-sm" onError={e=>(e.currentTarget.style.display="none")}/> : <div className="h-12 w-12"/>}
                    <span className="text-center text-xs font-bold text-text line-clamp-2">{f.away.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Players Tab ─────────────────────────────────────────────────────────────
type StatType = "topscorers" | "topassists" | "topyellowcards";
function PlayersTab({ leagueId, season }: { leagueId: string; season: string }) {
  const [type, setType] = useState<StatType>("topscorers");
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async (t: StatType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/top-scorers?league=${leagueId}&season=${season}&type=${t}`);
      const json = await res.json();
      setPlayers(json.players ?? []);
    } catch { setPlayers([]); }
    finally { setLoading(false); }
  }, [leagueId, season]);

  useEffect(() => { fetchPlayers(type); }, [type, fetchPlayers]);

  const tabs: { id: StatType; label: string; icon: string }[] = [
    { id: "topscorers", label: "Goals", icon: "⚽" },
    { id: "topassists", label: "Assists", icon: "🎯" },
    { id: "topyellowcards", label: "Yellow Cards", icon: "🟨" },
  ];

  const getStatValue = (p: any): number => {
    const goals = p?.statistics?.[0]?.goals ?? {};
    const cards = p?.statistics?.[0]?.cards ?? {};
    if (type === "topscorers") return goals.total ?? 0;
    if (type === "topassists") return goals.assists ?? 0;
    return cards.yellow ?? 0;
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-5 flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              type === t.id ? "bg-primary text-white" : "bg-card text-text-secondary hover:text-text"
            }`}
          ><span>{t.icon}</span>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>
      ) : players.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">No data available</p>
      ) : (
        <div className="grid gap-2">
          {players.map((p: any, i: number) => {
            const player = p?.player ?? {};
            const stats = p?.statistics?.[0] ?? {};
            const team = stats?.team ?? {};
            const val = getStatValue(p);
            return (
              <div key={player.id ?? i} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
                <span className={`w-7 flex-shrink-0 text-sm font-black ${i < 3 ? "text-primary" : "text-text-secondary"}`}>{i + 1}</span>
                {player.photo ? (
                  <img src={player.photo} alt="" className="h-10 w-10 flex-shrink-0 rounded-full object-cover bg-card-hover" onError={e=>(e.currentTarget.style.display="none")}/>
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-card-hover flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-text">{player.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {team.logo && <img src={team.logo} alt="" className="h-3.5 w-3.5 object-contain" onError={e=>(e.currentTarget.style.display="none")}/>}
                    <span className="text-xs text-text-secondary truncate">{team.name}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-lg font-black text-primary">{val}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Teams Tab ───────────────────────────────────────────────────────────────
function TeamsTab({ fixtures }: { fixtures: MatchData[] }) {
  const teams = useMemo(() => {
    const m: Record<string, { logo?: string; gf: number; ga: number; played: number; won: number; drew: number; lost: number }> = {};
    for (const f of fixtures) {
      if (f.status !== "finished") continue;
      const hg = f.homeScore ?? 0;
      const ag = f.awayScore ?? 0;
      for (const [name, logo, gf, ga] of [
        [f.homeTeam, f.homeTeamLogo, hg, ag],
        [f.awayTeam, f.awayTeamLogo, ag, hg],
      ] as [string, string | undefined, number, number][]) {
        if (!m[name]) m[name] = { logo, gf: 0, ga: 0, played: 0, won: 0, drew: 0, lost: 0 };
        m[name].gf += gf; m[name].ga += ga; m[name].played++;
        if (gf > ga) m[name].won++;
        else if (gf === ga) m[name].drew++;
        else m[name].lost++;
      }
    }
    return Object.entries(m).sort((a, b) => b[1].gf - a[1].gf);
  }, [fixtures]);

  if (!teams.length) return <p className="py-8 text-center text-sm text-text-secondary">No team data yet — check back after matches are played</p>;

  const headers = ["#", "Team", "P", "W", "D", "L", "GF", "GA", "GD"];
  return (
    <div>
      <div className="mb-2 hidden sm:flex items-center px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
        <div className="w-6">#</div>
        <div className="flex-1 pl-8">Team</div>
        {["P","W","D","L","GF","GA","GD"].map(h => <div key={h} className="w-9 text-center">{h}</div>)}
      </div>
      <div className="grid gap-1">
        {teams.map(([name, t], i) => {
          const gd = t.gf - t.ga;
          return (
            <div key={name} className={`flex items-center rounded-xl px-3 py-2.5 ${i % 2 === 0 ? "bg-card" : ""}`}>
              <div className="w-6 flex-shrink-0 text-xs font-bold text-text-secondary">{i + 1}</div>
              <div className="flex flex-1 min-w-0 items-center gap-2 pl-2">
                {t.logo && <img src={t.logo} alt="" className="h-5 w-5 flex-shrink-0 object-contain" onError={e=>(e.currentTarget.style.display="none")}/>}
                <span className="truncate text-sm font-semibold text-text">{name}</span>
              </div>
              {[t.played, t.won, t.drew, t.lost, t.gf, t.ga, gd].map((v, vi) => (
                <div key={vi} className={`w-9 flex-shrink-0 text-center text-xs ${vi === 6 ? (v > 0 ? "text-green-500" : v < 0 ? "text-red-400" : "text-text-secondary") : "text-text-secondary"}`}>
                  {vi === 6 && v > 0 ? `+${v}` : v}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocale();

  const leagueName = getLocalizedLeagueName(searchParams.get("name") ?? "League", locale);
  const leagueLogo = searchParams.get("logo") ?? "";
  const isWorldCup = id === WORLD_CUP_ID;
  const season = isWorldCup ? "2022" : "2024";

  const tabs = isWorldCup ? ALL_TABS : BASE_TABS;
  const [activeTab, setActiveTab] = useState<Tab>("Fixtures");

  // Fixtures (shared across Fixtures, Results, Teams tabs)
  const [allFixtures, setAllFixtures] = useState<MatchData[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/fixtures?league=${id}&season=${season}`);
        const json = await res.json();
        const raw: MatchData[] = (json.fixtures ?? []).sort((a: MatchData, b: MatchData) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        if (!cancelled) setAllFixtures(raw);
      } catch {}
      finally { if (!cancelled) setFixturesLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id, season]);

  const upcoming = useMemo(() => allFixtures.filter(f => f.status === "upcoming" || f.status === "live"), [allFixtures]);
  const results  = useMemo(() => [...allFixtures.filter(f => f.status === "finished")].reverse(), [allFixtures]);

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <div className="flex items-center gap-3">
          {leagueLogo && (
            <img src={leagueLogo} alt={leagueName} className="h-12 w-12 object-contain drop-shadow-sm"
              onError={e => (e.currentTarget.style.display = "none")}/>
          )}
          <div>
            <h1 className="text-2xl font-black text-text">{leagueName}</h1>
            <p className="text-sm text-text-secondary">{fixturesLoading ? "Loading…" : `${allFixtures.length} matches · Season ${season}`}</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="hide-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-border/40 pb-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-shrink-0 px-4 pb-3 pt-1 text-sm font-bold transition-colors ${
              activeTab === tab ? "text-primary" : "text-text-secondary hover:text-text"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary"/>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Fixtures" && (
        <MatchListTab matches={upcoming} loading={fixturesLoading} emptyMsg="No upcoming fixtures"/>
      )}
      {activeTab === "Results" && (
        <MatchListTab matches={results} loading={fixturesLoading} emptyMsg="No results yet"/>
      )}
      {activeTab === "Standings" && (
        <StandingsTab leagueId={id} season={season} isWorldCup={isWorldCup}/>
      )}
      {activeTab === "Draw" && isWorldCup && (
        <DrawTab leagueId={id} season={season}/>
      )}
      {activeTab === "Players" && isWorldCup && (
        <PlayersTab leagueId={id} season={season}/>
      )}
      {activeTab === "Teams" && isWorldCup && (
        <TeamsTab fixtures={allFixtures}/>
      )}
    </div>
  );
}
