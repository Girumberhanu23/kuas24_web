"use client";

import { useState } from "react";
import NewsCard from "../components/NewsCard";
import { newsArticles } from "../lib/data";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("sportslive-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("sportslive-favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const favoriteArticles = newsArticles.filter((a) =>
    favorites.includes(a.id)
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-text">Favorites</h1>
        <p className="text-sm text-text-secondary">
          Your saved articles and stories
        </p>
      </div>

      {favoriteArticles.length > 0 ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-text-secondary">
              {favoriteArticles.length} saved article
              {favoriteArticles.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => {
                setFavorites([]);
                localStorage.removeItem("sportslive-favorites");
              }}
              className="text-xs font-medium text-secondary transition-colors hover:text-primary"
            >
              Clear All
            </button>
          </div>

          {/* Featured favorites */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {favoriteArticles
              .filter((a) => a.featured)
              .map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  featured
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
          </div>

          {/* Regular favorites */}
          <div className="grid gap-3">
            {favoriteArticles
              .filter((a) => !a.featured)
              .map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-secondary"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-text">
            No favorites yet
          </h3>
          <p className="max-w-xs text-center text-sm text-text-secondary">
            Start saving articles by tapping the heart icon on any news story
          </p>
        </div>
      )}
    </div>
  );
}
