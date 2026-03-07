"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  Fixture,
  FixtureEvent,
  FixtureEventsResponse,
  FixtureStatisticsResponse,
  FixtureTeamStatistics,
  LineupsResponse,
  StandingRow,
  StandingsResponse,
} from "../../lib/types";
import LineupPitch from "../../components/LineupPitch";

type TabId = "summary" | "lineups" | "stats" | "standings";

const LEAGUE_ID = "39";
const FIXTURES_SEASON = "2023";

const tabItems: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "lineups", label: "Lineups" },
  { id: "stats", label: "Stats" },
  { id: "standings", label: "Standings" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3);
}

export default function FixtureDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const paramId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const fixtureId =
    paramId?.trim() || searchParams.get("fixtureId")?.trim() || "";

  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineups, setLineups] = useState<LineupsResponse | null>(null);
  const [lineupsError, setLineupsError] = useState<string | null>(null);
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [events, setEvents] = useState<FixtureEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [standingsLeagueName, setStandingsLeagueName] = useState<string>("Standings");
  const [standingsSeason, setStandingsSeason] = useState<number | null>(null);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [statistics, setStatistics] = useState<FixtureTeamStatistics[]>([]);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/fixtures?league=${LEAGUE_ID}&season=${FIXTURES_SEASON}`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load fixture");
        }
        const json = (await res.json()) as { fixtures: Fixture[] };
        const match = (json.fixtures ?? []).find((f) => f.id === fixtureId);
        if (!cancelled) {
          setFixture(match ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load fixture");
          setFixture(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [fixtureId]);

  useEffect(() => {
    let cancelled = false;
    if (!fixtureId) return;
    const loadLineups = async () => {
      setLineupsError(null);
      setLineupsLoading(true);
      try {
        const res = await fetch(`/api/fixtures/${encodeURIComponent(fixtureId)}/lineups`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load lineups");
        }
        const json = (await res.json()) as LineupsResponse;
        if (!cancelled) {
          setLineups(json);
        }
      } catch (err) {
        if (!cancelled) {
          setLineupsError(err instanceof Error ? err.message : "Failed to load lineups");
          setLineups(null);
        }
      } finally {
        if (!cancelled) setLineupsLoading(false);
      }
    };

    loadLineups();
    return () => {
      cancelled = true;
    };
  }, [fixtureId]);

  useEffect(() => {
    let cancelled = false;
    if (!fixtureId || activeTab !== "summary") return;

    const loadEvents = async () => {
      setEventsError(null);
      setEventsLoading(true);
      try {
        const res = await fetch(`/api/fixtures/${encodeURIComponent(fixtureId)}/events`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load events");
        }
        const json = (await res.json()) as FixtureEventsResponse;
        if (!cancelled) {
          const sortedEvents = [...(json.events ?? [])].sort((a, b) => {
            const minuteA = (a.time?.elapsed ?? 0) * 100 + (a.time?.extra ?? 0);
            const minuteB = (b.time?.elapsed ?? 0) * 100 + (b.time?.extra ?? 0);
            return minuteA - minuteB;
          });
          setEvents(sortedEvents);
        }
      } catch (err) {
        if (!cancelled) {
          setEventsError(err instanceof Error ? err.message : "Failed to load events");
          setEvents([]);
        }
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [fixtureId, activeTab]);

  useEffect(() => {
    let cancelled = false;
    if (activeTab !== "standings") return;

    const loadStandings = async () => {
      setStandingsError(null);
      setStandingsLoading(true);
      try {
        const seasonsToTry = [FIXTURES_SEASON, "2024"];
        let lastError: string | null = null;

        for (const season of seasonsToTry) {
          const res = await fetch(`/api/standings?league=${LEAGUE_ID}&season=${season}`);
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            const errorMessage = body?.error || "Failed to load standings";
            lastError = errorMessage;

            if (errorMessage === "Standings not available") {
              continue;
            }

            throw new Error(errorMessage);
          }

          const json = (await res.json()) as StandingsResponse;
          const rows = Array.isArray(json.standings) ? json.standings : [];
          if (!cancelled) {
            setStandings(rows);
            setStandingsLeagueName(json.league?.name ?? "Standings");
            setStandingsSeason(json.league?.season ?? null);
          }
          return;
        }

        throw new Error(lastError || "Standings not available");
      } catch (err) {
        if (!cancelled) {
          setStandingsError(err instanceof Error ? err.message : "Failed to load standings");
          setStandings([]);
        }
      } finally {
        if (!cancelled) setStandingsLoading(false);
      }
    };

    loadStandings();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    if (!fixtureId || activeTab !== "stats") return;

    const loadStatistics = async () => {
      setStatisticsError(null);
      setStatisticsLoading(true);
      try {
        const res = await fetch(`/api/fixtures/${encodeURIComponent(fixtureId)}/statistics`);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load statistics");
        }

        const json = (await res.json()) as FixtureStatisticsResponse;
        if (!cancelled) {
          setStatistics(json.response ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setStatisticsError(err instanceof Error ? err.message : "Failed to load statistics");
          setStatistics([]);
        }
      } finally {
        if (!cancelled) setStatisticsLoading(false);
      }
    };

    loadStatistics();
    return () => {
      cancelled = true;
    };
  }, [fixtureId, activeTab]);

  const statusLabel = useMemo(() => {
    if (!fixture) return "";
    if (fixture.status === "live") return fixture.minute || "Live";
    if (fixture.status === "finished") return "FT";
    return fixture.time;
  }, [fixture]);

  const headline = fixture
    ? `${fixture.homeTeam} vs ${fixture.awayTeam}`
    : "Fixture details";

  const hasLineups = lineups?.home?.startXI?.length && lineups?.away?.startXI?.length;

  const formatMinute = (event: FixtureEvent) => {
    const elapsed = event.time?.elapsed;
    if (typeof elapsed !== "number") return "--'";
    const extra = event.time?.extra;
    return extra ? `${elapsed}+${extra}'` : `${elapsed}'`;
  };

  const normalizeName = (name: string) => name.trim().toLowerCase();

  const eventSide = (event: FixtureEvent): "home" | "away" => {
    const teamId = event.team?.id;
    const homeTeamId = lineups?.home?.team?.id;
    const awayTeamId = lineups?.away?.team?.id;

    if (teamId && homeTeamId && teamId === homeTeamId) return "home";
    if (teamId && awayTeamId && teamId === awayTeamId) return "away";

    const teamName = normalizeName(event.team?.name || "");
    const homeName = normalizeName(fixture?.homeTeam || "");
    if (teamName && teamName === homeName) return "home";

    return "away";
  };

  const eventIcon = (event: FixtureEvent) => {
    const type = event.type.toLowerCase();
    if (type === "goal") return "⚽";
    if (type === "card") return "🟨";
    if (type === "subst") return "🔄";
    return "•";
  };

  const isGoalEvent = (event: FixtureEvent) => event.type.toLowerCase() === "goal";

  const secondaryEventText = (event: FixtureEvent) => {
    if (event.assist?.name) return event.assist.name;
    if (event.comments) return event.comments;
    if (event.detail) return event.detail;
    return null;
  };

  const goalCardStyle = {
    borderColor: "color-mix(in oklab, var(--color-goal) 45%, transparent)",
    backgroundColor: "color-mix(in oklab, var(--color-goal) 12%, transparent)",
  };

  const goalIconStyle = {
    borderColor: "color-mix(in oklab, var(--color-goal) 55%, transparent)",
    backgroundColor: "color-mix(in oklab, var(--color-goal) 20%, transparent)",
    color: "var(--color-goal)",
  };

  const goalPillStyle = {
    backgroundColor: "color-mix(in oklab, var(--color-goal) 20%, transparent)",
    color: "var(--color-goal)",
  };

  const formatStatValue = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  const numericStatValue = (value: number | string | null | undefined) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const statLabel = (type: string) => {
    const map: Record<string, string> = {
      "Ball Possession": "Possession",
      "Total Shots": "Shots",
      "Shots on Goal": "Shots on target",
      "Corner Kicks": "Corners",
    };
    return map[type] ?? type;
  };

  const teamCode = (name?: string) => {
    if (!name) return "---";
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 3) {
      return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
    }
    return name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "---";
  };

  const homeStats = statistics[0] ?? null;
  const awayStats = statistics[1] ?? null;
  const statTypes = Array.from(
    new Set([
      ...(homeStats?.statistics.map((item) => item.type) ?? []),
      ...(awayStats?.statistics.map((item) => item.type) ?? []),
    ])
  );

  const preferredStatOrder = [
    "Ball Possession",
    "Total Shots",
    "Shots on Goal",
    "Corner Kicks",
    "Fouls",
    "Yellow Cards",
    "Red Cards",
  ];

  const orderedStatTypes = [
    ...preferredStatOrder.filter((type) => statTypes.includes(type)),
    ...statTypes.filter((type) => !preferredStatOrder.includes(type)),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/fixtures"
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-text-secondary hover:text-text"
          >
            Back
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {fixture?.league ?? "League"}
            </p>
            <h1 className="text-lg font-bold text-text md:text-xl">{headline}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-text-secondary">
            {statusLabel}
          </span>
          {fixture?.status === "live" ? (
            <span className="rounded-full bg-live/15 px-3 py-1 text-xs font-semibold text-live">
              Live
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-surface/70 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>{fixture?.league ?? "League"}</span>
            <span>{fixture?.time ?? "--:--"}</span>
          </div>
        </div>
        <div className="px-5 py-6">
          {loading ? (
            <p className="text-sm text-text-secondary">Loading fixture details...</p>
          ) : fixture ? (
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-center gap-3">
                {fixture.homeTeamLogo ? (
                  <img
                    src={fixture.homeTeamLogo}
                    alt={`${fixture.homeTeam} logo`}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-xs font-bold text-text-secondary">
                    {initials(fixture.homeTeam)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-text md:text-base">
                    {fixture.homeTeam}
                  </p>
                  <p className="text-[11px] text-text-secondary">Home</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-text">
                  {fixture.homeScore ?? "-"}
                </span>
                <span className="text-sm font-semibold text-text-secondary">-</span>
                <span className="text-3xl font-bold text-text">
                  {fixture.awayScore ?? "-"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-text md:text-base">
                    {fixture.awayTeam}
                  </p>
                  <p className="text-[11px] text-text-secondary">Away</p>
                </div>
                {fixture.awayTeamLogo ? (
                  <img
                    src={fixture.awayTeamLogo}
                    alt={`${fixture.awayTeam} logo`}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-xs font-bold text-text-secondary">
                    {initials(fixture.awayTeam)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Fixture not found.</p>
          )}

          {error ? (
            <div className="mt-3 text-xs text-text-secondary">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-b border-border">
        <div className="hide-scrollbar flex gap-6 overflow-x-auto">
          {tabItems.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-3 text-sm font-semibold transition-all ${
                  isActive ? "text-text" : "text-text-secondary hover:text-text"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full transition-all ${
                    isActive ? "bg-primary" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "lineups" ? (
        <div className="space-y-1">
          {lineupsLoading ? (
            <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
              Loading lineups...
            </div>
          ) : hasLineups && lineups ? (
            <LineupPitch
              home={lineups.home}
              away={lineups.away}
              homeTeamName={fixture?.homeTeam}
              awayTeamName={fixture?.awayTeam}
              referee={fixture?.referee}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
              {lineupsError ?? "Lineups not available for this fixture"}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "stats" ? (
        statisticsLoading ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            Loading match statistics...
          </div>
        ) : statisticsError ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            {statisticsError}
          </div>
        ) : orderedStatTypes.length ? (
          <div className="space-y-3">
            {orderedStatTypes.map((type) => {
              const homeValue = homeStats?.statistics.find((item) => item.type === type)?.value;
              const awayValue = awayStats?.statistics.find((item) => item.type === type)?.value;
              const homeNumeric = numericStatValue(homeValue);
              const awayNumeric = numericStatValue(awayValue);
              const total = homeNumeric + awayNumeric;
              const homeShare = total > 0 ? (homeNumeric / total) * 100 : 50;
              const awayShare = total > 0 ? (awayNumeric / total) * 100 : 50;

              return (
                <div key={type} className="rounded-2xl border border-border bg-card px-4 py-3">
                  <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center text-sm font-semibold uppercase tracking-[0.08em]">
                    <p className="truncate text-left text-text-secondary">
                      {teamCode(homeStats?.team.name ?? fixture?.homeTeam)}
                    </p>
                    <p className="px-2 text-center text-base font-medium normal-case tracking-normal text-text">
                      {statLabel(type)}
                    </p>
                    <p className="truncate text-right text-text-secondary">
                      {teamCode(awayStats?.team.name ?? fixture?.awayTeam)}
                    </p>
                  </div>

                  <div className="mb-2 h-3 overflow-hidden rounded-full bg-surface">
                    <div className="flex h-full w-full">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${homeShare}%` }}
                      />
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${awayShare}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_1fr] items-center text-sm font-semibold text-text">
                    <p className="text-left">{formatStatValue(homeValue)}</p>
                    <p className="text-right">{formatStatValue(awayValue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            No statistics available for this fixture
          </div>
        )
      ) : null}

      {activeTab === "summary" ? (
        eventsLoading ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            Loading match events...
          </div>
        ) : eventsError ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            {eventsError}
          </div>
        ) : events.length ? (
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="relative space-y-4">
              <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-border" />
              {events.map((event, index) => (
                <div
                  key={`${event.team?.id ?? "team"}-${event.player?.id ?? index}-${event.type}-${event.time?.elapsed ?? index}`}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
                >
                  <div className="min-w-0">
                    {eventSide(event) === "home" ? (
                      <div
                        className={`ml-auto w-full max-w-xs rounded-xl px-3 py-3 text-right ${
                          isGoalEvent(event)
                            ? "border"
                            : "bg-surface/70"
                        }`}
                        style={isGoalEvent(event) ? goalCardStyle : undefined}
                      >
                        <p className="truncate text-sm font-bold text-text">
                          {event.player?.name || "Unknown Player"}
                        </p>
                        {secondaryEventText(event) ? (
                          <p className="truncate text-sm text-text-secondary">
                            {secondaryEventText(event)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-text-secondary">
                          {event.detail}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <span
                      className={`flex items-center justify-center rounded-full leading-none ${
                        isGoalEvent(event)
                          ? "h-8 w-8 border text-xl"
                          : "h-6 w-6 text-lg"
                      }`}
                      style={isGoalEvent(event) ? goalIconStyle : undefined}
                    >
                      {eventIcon(event)}
                    </span>
                    <span className="text-base font-bold text-text">{formatMinute(event)}</span>
                    {isGoalEvent(event) ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
                        style={goalPillStyle}
                      >
                        Goal
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    {eventSide(event) === "away" ? (
                      <div
                        className={`w-full max-w-xs rounded-xl px-3 py-3 text-left ${
                          isGoalEvent(event)
                            ? "border"
                            : "bg-surface/70"
                        }`}
                        style={isGoalEvent(event) ? goalCardStyle : undefined}
                      >
                        <p className="truncate text-sm font-bold text-text">
                          {event.player?.name || "Unknown Player"}
                        </p>
                        {secondaryEventText(event) ? (
                          <p className="truncate text-sm text-text-secondary">
                            {secondaryEventText(event)}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-text-secondary">
                          {event.detail}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            No match events available for this fixture
          </div>
        )
      ) : null}

      {activeTab === "standings" ? (
        standingsLoading ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            Loading standings...
          </div>
        ) : standingsError ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            {standingsError}
          </div>
        ) : standings.length ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-surface/70 px-4 py-3">
              <p className="text-sm font-semibold text-text">{standingsLeagueName}</p>
              <p className="text-xs font-medium text-text-secondary">
                Season {standingsSeason ?? "--"}
              </p>
            </div>

            <div className="hide-scrollbar overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-surface/40 text-xs uppercase tracking-[0.08em] text-text-secondary">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-center">MP</th>
                    <th className="px-3 py-2 text-center">W</th>
                    <th className="px-3 py-2 text-center">D</th>
                    <th className="px-3 py-2 text-center">L</th>
                    <th className="px-3 py-2 text-center">GF</th>
                    <th className="px-3 py-2 text-center">GA</th>
                    <th className="px-3 py-2 text-center">GD</th>
                    <th className="px-3 py-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.team.id} className="border-t border-border/70 hover:bg-surface/30">
                      <td className="px-3 py-2 font-semibold text-text">{row.rank}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {row.team.logo ? (
                            <img
                              src={row.team.logo}
                              alt={`${row.team.name} logo`}
                              className="h-5 w-5 object-contain"
                            />
                          ) : null}
                          <span className="font-medium text-text">{row.team.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-text-secondary">{row.all.played}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">{row.all.win}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">{row.all.draw}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">{row.all.lose}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">{row.all.goals.for}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">{row.all.goals.against}</td>
                      <td className="px-3 py-2 text-center text-text-secondary">
                        {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-text">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-text-secondary">
            No standings available
          </div>
        )
      ) : null}
    </div>
  );
}
