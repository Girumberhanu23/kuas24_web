"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdCard from "../../components/AdCard";
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

function readingMinutesFor(content: string): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(wordCount / 180));
}

const RELATED_BADGE_STYLES = [
  "bg-primary/15 text-primary",
  "bg-secondary/15 text-secondary",
  "bg-goal/15 text-goal",
  "bg-live/15 text-live",
];

function relatedBadgeClass(id: string): string {
  return RELATED_BADGE_STYLES[hashStringToPositiveInt(id) % RELATED_BADGE_STYLES.length];
}

function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5 15.4 17.5" />
      <path d="M15.4 6.5 8.6 10.5" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}


export default function NewsDetailClient({
  article,
  relatedNews,
}: {
  article: NewsArticle;
  relatedNews: NewsArticle[];
}) {
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
  const [isImageOpen, setIsImageOpen] = useState(false);

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const updated = prev.includes(article.id)
        ? prev.filter((id) => id !== article.id)
        : [...prev, article.id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!isImageOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsImageOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isImageOpen]);

  const related = useMemo(() => {
    return relatedNews
      .filter((item) => item.id !== article.id)
      .slice(0, 6);
  }, [article.id, relatedNews]);

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

  const readingMinutes = useMemo(
    () => readingMinutesFor(paragraphs.join(" ")),
    [paragraphs]
  );

  const pullQuote = useMemo(() => {
    const sentences = (article.content || "")
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 50 && s.length <= 160);
    if (!sentences.length) return null;
    const seed = hashStringToPositiveInt(`${article.id}-quote`);
    return sentences[seed % sentences.length];
  }, [article.content, article.id]);

  const channelSlug = slugify(article.author);
  const channelHref = `/channel/${encodeURIComponent(channelSlug)}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: article.title, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled share or clipboard unavailable — ignore
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Floating action rail */}
      <div className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share article"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 text-text-secondary shadow-sm backdrop-blur-sm transition-colors hover:text-primary"
        >
          <ShareIcon />
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from saved" : "Save article"}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 shadow-sm backdrop-blur-sm transition-colors ${
            isFavorite ? "text-secondary" : "text-text-secondary hover:text-primary"
          }`}
        >
          <BookmarkIcon filled={isFavorite} />
        </button>
      </div>

      {/* Hero — full-bleed dark photo banner, always dark regardless of site theme.
          Image is the positioned container; badge/headline/meta sit absolutely on top of it.
          -mt cancels out main's top padding so this touches the header with zero gap. */}
      <div className="relative left-1/2 -mt-4 mb-8 h-[60vh] min-h-100 max-h-160 w-screen -translate-x-1/2 overflow-hidden sm:-mt-6">
        {article.imageUrl ? (
          <button
            type="button"
            onClick={() => setIsImageOpen(true)}
            aria-label="Open image"
            className="absolute inset-0 h-full w-full cursor-zoom-in"
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </button>
        ) : (
          <div className={`absolute inset-0 h-full w-full bg-gradient-to-br ${article.imageGradient}`} />
        )}

        {/* Gradient: image reads clearly in the top ~55%, then ramps quickly to near-solid
            black over the bottom ~40% so the overlaid text has strong contrast. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,0.97) 100%)",
          }}
        />

        {/* Badge + headline + meta — absolutely positioned on top of the gradient.
            pointer-events-none lets taps fall through to the image button behind it,
            except on the author link which opts back in. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-1 mx-auto w-full max-w-4xl px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
          <span className="mb-3 inline-block w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            {article.category}
          </span>

          <h1 className="mb-3 line-clamp-2 text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-white/75 sm:text-sm">
            <Link href={channelHref} className="pointer-events-auto flex items-center gap-2 hover:text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white">
                {article.author.charAt(0)}
              </span>
              By {article.author}
            </Link>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1">
              <CalendarIcon />
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-1">
              <ClockIcon />
              {readingMinutes} min read
            </span>
          </div>
        </div>
      </div>

      {isImageOpen && article.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setIsImageOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-h-[90vh] max-w-[92vw]">
            <button
              type="button"
              onClick={() => setIsImageOpen(false)}
              className="absolute -right-3 -top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
              aria-label="Close image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <img
              src={article.imageUrl}
              alt={article.title}
              className="max-h-[90vh] w-auto max-w-[92vw] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
      {/* Content + Ad */}
      <article className="min-w-0">
        <div className="grid gap-5">
          {paragraphs[0] && (
            <p className="text-[15px] leading-relaxed text-text first-letter:mr-2 first-letter:float-left first-letter:text-5xl first-letter:font-extrabold first-letter:leading-[0.85] first-letter:text-primary">
              {paragraphs[0]}
            </p>
          )}

          <AdCard
            title="Matchday Refresh"
            body="A cool banner-style placement for sponsors — perfect for matchweek campaigns."
            variant="banner"
          />

          {pullQuote && (
            <blockquote className="rounded-r-xl border-l-4 border-primary bg-card py-4 pl-5 pr-4">
              <p className="text-lg font-semibold italic leading-snug text-text sm:text-xl">
                “{pullQuote}”
              </p>
            </blockquote>
          )}

          {paragraphs.slice(1).map((p, idx) => (
            <p key={idx + 1} className="text-[15px] leading-relaxed text-text">
              {p}
            </p>
          ))}
        </div>
      </article>

      {/* Up next */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Up Next
          </h3>
          <Link href="/" className="text-xs font-semibold text-primary hover:text-primary-hover">
            All News →
          </Link>
        </div>

        {related.length ? (
          <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
            {related[0] && (
              <Link
                href={`/news/${related[0].id}`}
                className="group relative block overflow-hidden rounded-2xl border border-border"
              >
                <div className="h-48 w-full sm:h-full sm:min-h-[220px]">
                  {related[0].imageUrl ? (
                    <img
                      src={related[0].imageUrl}
                      alt={related[0].title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${related[0].imageGradient}`}
                    />
                  )}
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span
                    className={`mb-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${relatedBadgeClass(
                      related[0].id
                    )}`}
                  >
                    {related[0].category}
                  </span>
                  <h4 className="text-base font-bold leading-snug text-white sm:text-lg">
                    {related[0].title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-white/75">
                    {related[0].excerpt}
                  </p>
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-3">
              {related.slice(1, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${item.imageGradient}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide ${relatedBadgeClass(
                        item.id
                      )}`}
                    >
                      {item.category}
                    </span>
                    <h5 className="truncate text-sm font-semibold text-text group-hover:text-primary">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-text-secondary">
                      {readingMinutesFor(item.content)} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-text-secondary">No related posts yet.</p>
          </div>
        )}
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
