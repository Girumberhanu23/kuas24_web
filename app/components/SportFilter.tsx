"use client";

import { LeagueCategory } from "../lib/types";
import { leagueCategories } from "../lib/data";

interface SportFilterProps {
  selected: string;
  onSelect: (id: string) => void;
  categories?: LeagueCategory[];
}

export default function SportFilter({
  selected,
  onSelect,
  categories = leagueCategories,
}: SportFilterProps) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selected === cat.id
              ? "bg-primary text-white"
              : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
