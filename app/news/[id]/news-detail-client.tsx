"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdCard from "../../components/AdCard";
import NewsCard from "../../components/NewsCard";
import { newsArticles } from "../../lib/data";
import type { NewsArticle } from "../../lib/types";
import { slugify } from "../../lib/slug";

const FAVORITES_KEY = "sportslive-favorites";

function hashStringToPositiveInt(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export default function NewsDetailClient({ article }: { article: NewsArticle }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const isFavorite = favorites.includes(article.id);

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const updated = prev.includes(article.id)
        ? prev.filter((id) => id !== article.id)
        : [...prev, article.id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const related = useMemo(() => {
    const sameLeague = newsArticles
      .filter((a) => a.id !== article.id)
      .filter((a) => a.league === article.league);

    const fillPool = newsArticles.filter((a) => a.id !== article.id);

    const combined = [...sameLeague];
    for (const item of fillPool) {
      if (combined.length >= 6) break;
      if (!combined.find((a) => a.id === item.id)) combined.push(item);
    }

    return combined.slice(0, 6);
  }, [article.id, article.league]);

  const paragraphs = useMemo(() => {
    const text = article.content || "";
    const parts = text
      .split(/\n\n+/)
      .flatMap((p) => p.split(/(?<=[.!?])\s+/))
      .map((p) => p.trim())
      .filter(Boolean);

    // Keep it readable: group into paragraphs.
    const grouped: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      grouped.push(parts.slice(i, i + 2).join(" "));
    }
    return grouped.length ? grouped : [article.excerpt];
  }, [article.content, article.excerpt]);

  const mock = useMemo(() => {
    const seed = hashStringToPositiveInt(`${article.id}:${article.author}`);
    const wordCount = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
    const readingMinutes = Math.max(2, Math.round(wordCount / 180));

    const views = 2_000 + (seed % 128_000);
    const likes = 80 + (seed % 7_500);
    const shares = 10 + (seed % 1_200);
    const commentsCount = 3 + (seed % 140);

    const names = [
      "Amanuel",
      "Selam",
      "Daniel",
      "Ruth",
      "Eden",
      "Jonas",
      "Mariam",
      "Kaleb",
    ];
    const templates = [
      `Big week in ${article.league}. This could change everything.`,
      `Love the angle here — ${article.category} coverage has been great.`,
      "Interesting take. Would like to see a follow-up after the next match.",
      "Solid summary. The details matter a lot this season.",
      "This is exactly why football is chaos — in the best way.",
    ];

    const comments = Array.from({ length: 3 }).map((_, idx) => {
      const name = names[(seed + idx * 7) % names.length];
      const message = templates[(seed + idx * 11) % templates.length];
      const minutesAgo = 8 + ((seed + idx * 13) % 180);
      return { name, message, minutesAgo };
    });

    return {
      views,
      likes,
      shares,
      commentsCount,
      readingMinutes,
      comments,
    };
  }, [article.author, article.category, article.id, article.league, paragraphs]);

  const channelSlug = slugify(article.author);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {article.category}
          </span>
          <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-text-secondary">
            {article.league}
          </span>
          <span className="text-xs text-text-secondary">•</span>
          <span className="text-xs text-text-secondary">
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="mb-3 text-2xl font-bold leading-tight text-text sm:text-3xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/channel/${encodeURIComponent(channelSlug)}`}
            className="group flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {article.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-text group-hover:text-primary">
                {article.author}
              </p>
              <p className="text-xs text-text-secondary">View channel</p>
            </div>
          </Link>

          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-card-hover ${
              isFavorite ? "text-secondary" : "text-text-secondary"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className={`h-48 w-full bg-gradient-to-br ${article.imageGradient} sm:h-64`}
        />
        <div className="p-5">
          <p className="text-sm leading-relaxed text-text-secondary">
            {article.excerpt}
          </p>

          {/* Mock engagement row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-text-secondary">
              {formatCompactNumber(mock.views)} views
            </span>
            <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-text-secondary">
              {mock.readingMinutes} min read
            </span>
          </div>
        </div>
      </div>

      {/* Content + Ad */}
      <div className="grid gap-8">
        <article className="min-w-0">
          <div className="grid gap-4">
            {paragraphs.slice(0, 2).map((p, idx) => (
              <p key={idx} className="text-sm leading-relaxed text-text">
                {p}
              </p>
            ))}

            <div className="my-2">
              <AdCard
                title="Matchday Refresh"
                body="A cool banner-style placement for sponsors — perfect for matchweek campaigns."
                variant="banner"
              />
            </div>

            {paragraphs.slice(2).map((p, idx) => (
              <p
                key={idx + 2}
                className="text-sm leading-relaxed text-text"
              >
                {p}
              </p>
            ))}
          </div>
        </article>
      </div>

      {/* Related news */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Related News
          </h3>
        </div>
        <div className="grid gap-3">
          {related.length ? (
            related
              .slice(0, Math.max(4, related.length))
              .map((item) => <NewsCard key={item.id} article={item} />)
          ) : (
            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">No related posts yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/"
          className="text-sm font-semibold text-primary hover:text-primary-hover"
        >
          ← Back to News
        </Link>
      </div>
    </div>
  );
}
