"use client";

import { useState } from "react";
import SportFilter from "../components/SportFilter";
import FixtureCard from "../components/FixtureCard";
import { fixtures } from "../lib/data";

type StatusFilter = "all" | "live" | "upcoming" | "finished";

export default function FixturesPage() {
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredFixtures = fixtures.filter((f) => {
    const leagueMatch =
      selectedLeague === "all" || f.league === selectedLeague;
    const statusMatch = statusFilter === "all" || f.status === statusFilter;
    return leagueMatch && statusMatch;
  });

  // Group by league
  const grouped = filteredFixtures.reduce(
    (acc, fixture) => {
      if (!acc[fixture.league]) acc[fixture.league] = [];
      acc[fixture.league].push(fixture);
      return acc;
    },
    {} as Record<string, typeof fixtures>
  );

  const statusTabs: { id: StatusFilter; label: string; color: string }[] = [
    { id: "all", label: "All", color: "text-text" },
    { id: "live", label: "Live", color: "text-live" },
    { id: "upcoming", label: "Upcoming", color: "text-primary" },
    { id: "finished", label: "Finished", color: "text-text-secondary" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-text">Fixtures</h1>
        <p className="text-sm text-text-secondary">
          Live scores, upcoming matches, and results
        </p>
      </div>

      {/* League Filter */}
      <div className="mb-4">
        <SportFilter selected={selectedLeague} onSelect={setSelectedLeague} />
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === tab.id
                ? "bg-card border border-primary/30 " + tab.color
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
          const date = new Date();
          date.setDate(date.getDate() + offset);
          const isToday = offset === 0;
          return (
            <button
              key={offset}
              className={`flex flex-shrink-0 flex-col items-center rounded-lg px-4 py-2 transition-all ${
                isToday
                  ? "bg-primary text-white"
                  : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
              }`}
            >
              <span className="text-[10px] font-medium uppercase">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-sm font-bold">
                {date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fixtures List */}
      {Object.keys(grouped).length > 0 ? (
        <div className="grid gap-6">
          {Object.entries(grouped).map(([league, leagueFixtures]) => (
            <div key={league}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  {league}
                </h3>
                <span className="rounded bg-card px-1.5 py-0.5 text-[10px] text-text-secondary">
                  {leagueFixtures.length}
                </span>
              </div>
              <div className="grid gap-2">
                {leagueFixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="mb-3 text-text-secondary"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <p className="text-sm text-text-secondary">
            No fixtures found for this filter
          </p>
        </div>
      )}
    </div>
  );
}
