"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEventHandler } from "react";
import { slugify } from "../lib/slug";
import type { NewsArticle } from "../lib/types";

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function NewsCard({
  article,
  featured = false,
  isFavorite = false,
  onToggleFavorite,
}: NewsCardProps) {
  const router = useRouter();
  const channelHref = `/channel/${encodeURIComponent(slugify(article.author))}`;
  const detailHref = `/news/${article.id}`;

  const openDetail = () => router.push(detailHref);

  const onCardKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetail();
    }
  };

  if (featured) {
    return (
      <article
        role="link"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={onCardKeyDown}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30"
        aria-label={`Open: ${article.title}`}
      >
        <div className="relative h-56 w-full sm:h-64">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${article.imageGradient}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
              {article.category}
            </span>
            <span className="rounded-full bg-bg/70 px-3 py-1 text-xs font-medium text-text backdrop-blur-sm">
              {article.league}
            </span>
          </div>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(article.id);
              }}
              className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-bg/70 backdrop-blur-sm transition-all hover:bg-bg/85 ${
                isFavorite ? "text-secondary" : "text-text-secondary"
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5">
          <h2 className="mb-2 text-xl font-bold leading-tight text-text transition-colors group-hover:text-primary sm:text-2xl">
            {article.title}
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {article.author.charAt(0)}
              </div>
              <Link
                href={channelHref}
                className="hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {article.author}
              </Link>
            </div>
            <span className="text-border">•</span>
            <span>
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={onCardKeyDown}
      className="group flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card-hover sm:flex-row"
      aria-label={`Open: ${article.title}`}
    >
      <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${article.imageGradient}`} />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {article.category}
            </span>
            <span className="text-[10px] text-text-secondary">{article.league}</span>
          </div>
          <h3 className="break-words text-sm font-semibold leading-snug text-text transition-colors group-hover:text-primary sm:text-base">
            {article.title}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-text-secondary">
            <Link
              href={channelHref}
              className="hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {article.author}
            </Link>
            <span className="text-border">•</span>
            <span>
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(article.id);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-bg ${
                isFavorite ? "text-secondary" : "text-text-secondary"
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
