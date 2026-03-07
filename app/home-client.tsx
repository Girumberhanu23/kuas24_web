"use client";

import { useState } from "react";
import NewsCard from "./components/NewsCard";
import SportFilter from "./components/SportFilter";
import AdCard from "./components/AdCard";
import type { NewsArticle } from "./lib/types";

interface HomeClientProps {
  initialNews: NewsArticle[];
}

export default function HomeClient({ initialNews }: HomeClientProps) {
  const [selectedLeague, setSelectedLeague] = useState("all");
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

  const filteredNews =
    selectedLeague === "all"
      ? initialNews
      : initialNews.filter((a) => a.league === selectedLeague);

  const featuredArticles = filteredNews.filter((a) => a.featured);
  const regularArticles = filteredNews.filter((a) => !a.featured);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
      {/* League Filter */}
      <div className="min-w-0">
        <SportFilter selected={selectedLeague} onSelect={setSelectedLeague} />
      </div>
      <div className="hidden xl:block" aria-hidden="true" />

      {/* Main Content */}
      <div className="min-w-0">
        {/* Featured News */}
        {featuredArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-text">
              Featured Stories
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  featured
                  isFavorite={favorites.includes(article.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mid-feed Ad */}
        <div className="mb-8">
          <AdCard
            title="Kuas24 Sponsored"
            body="Match previews, offers, and football brands — featured here."
            variant="banner"
          />
        </div>

        {/* Latest News */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-text">Latest News</h2>
          <div className="grid gap-3">
            {regularArticles.length > 0 ? (
              regularArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  isFavorite={favorites.includes(article.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mb-3 text-text-secondary"
                >
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
                <p className="text-sm text-text-secondary">
                  No news found for this league
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Trending */}
      <aside className="hidden min-w-0 xl:block">
        <div className="sticky top-24 w-full">
          <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-text">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Trending
            </h3>
            <div className="grid gap-3">
              {initialNews.slice(0, 5).map((article, idx) => (
                <a
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group flex min-w-0 cursor-pointer items-start gap-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="wrap-break-word text-sm font-medium leading-snug text-text transition-colors group-hover:text-primary">
                      {article.title}
                    </p>
                    <span className="text-[11px] text-text-secondary">
                      {article.category}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
