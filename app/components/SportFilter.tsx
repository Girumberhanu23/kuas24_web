"use client";

import { LeagueCategory } from "../lib/types";

interface SportFilterProps {
  selected: string;
  onSelect: (id: string) => void;
  categories: LeagueCategory[];
  loading?: boolean;
}

export default function SportFilter({
  selected,
  onSelect,
  categories,
  loading = false,
}: SportFilterProps) {
  return (
    <div className="relative">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
        {loading
          ? // Skeleton placeholders while leagues load
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-28 flex-shrink-0 animate-pulse rounded-full bg-card"
              />
            ))
          : categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selected === cat.id
                    ? "bg-primary text-white"
                    : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
                }`}
              >
                {cat.logo && (
                  <img
                    src={cat.logo}
                    alt=""
                    className="h-4 w-4 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                )}
                {cat.name}
              </button>
            ))}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent"
      />
    </div>
  );
}
