"use client";

import { useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { leagueCategories } from "../lib/data";

async function createNewsPost(payload: {
  broadcasterId: string;
  title: string;
  shortSummary: string;
  fullArticle: string;
  images: string[];
  category: string;
  pollOptions: string[];
  tags: string[];
  isHeadline: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}createNews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to publish news.";
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // Ignore JSON parsing errors
    }
    throw new Error(message);
  }

  return response.json();
}

function readFileAsDataUrl(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function PostNewsPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [league, setLeague] = useState("");
  const [author, setAuthor] = useState("");
  const [broadcasterId, setBroadcasterId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const leagueOptions = leagueCategories.filter((l) => l.id !== "all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const tags = [league].filter(Boolean);
      setUploadProgress(imageFiles.map(() => 0));
      const images = await Promise.all(
        imageFiles.map((file, index) =>
          readFileAsDataUrl(file, (progress) => {
            setUploadProgress((prev) => {
              const next = [...prev];
              next[index] = progress;
              return next;
            });
          })
        )
      );
      await createNewsPost({
        broadcasterId: broadcasterId.trim(),
        title: title.trim(),
        shortSummary: excerpt.trim(),
        fullArticle: content.trim(),
        images,
        category: category.trim() || league || "General",
        pollOptions: [],
        tags,
        isHeadline: false,
      });

      setShowSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setTitle("");
        setExcerpt("");
        setContent("");
        setCategory("");
        setLeague("");
        setAuthor("");
        setBroadcasterId("");
        setImageFiles([]);
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
        setUploadProgress([]);
        setShowSuccess(false);
        setShowPreview(false);
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to publish news."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    title.trim() &&
    excerpt.trim() &&
    content.trim() &&
    league &&
    author.trim() &&
    broadcasterId.trim();

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-text">Post News</h1>
        <p className="text-sm text-text-secondary">
          Share breaking sports news with the community
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-primary">
              Article Published Successfully!
            </p>
            <p className="text-sm text-text-secondary">
              Your news article is now live on the platform.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Headline *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling headline..."
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* League & Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                League *
              </label>
              <select
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-text outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                required
              >
                <option value="" className="text-text-secondary">
                  Select a league
                </option>
                {leagueOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Transfers, Match Preview, Team News..."
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Author Name *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name or broadcaster handle..."
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Broadcaster ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Broadcaster ID *
            </label>
            <input
              type="text"
              value={broadcasterId}
              onChange={(e) => setBroadcasterId(e.target.value)}
              placeholder="Enter your broadcaster ID"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Summary / Excerpt *
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a brief summary of the article (shown in previews)..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Full Article *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full article content..."
              rows={10}
              className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 text-sm leading-relaxed text-text placeholder-text-secondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Cover Image
            </label>
            <div className="rounded-xl border border-border bg-input p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (!files.length) return;

                  setImageFiles((prev) => [...prev, ...files]);
                  setImagePreviews((prev) => [
                    ...prev,
                    ...files.map((file) => URL.createObjectURL(file)),
                  ]);
                  setUploadProgress((prev) => [
                    ...prev,
                    ...files.map(() => 0),
                  ]);

                  e.currentTarget.value = "";
                }}
                className="w-full text-sm text-text file:mr-4 file:rounded-lg file:border-0 file:bg-primary/15 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/25"
              />
              <p className="mt-2 text-xs text-text-secondary">
                Upload JPG or PNG images (max ~5MB each recommended).
              </p>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {imagePreviews.map((preview, idx) => (
                    <div
                      key={`${preview}-${idx}`}
                      className="relative overflow-hidden rounded-lg border border-border"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setImageFiles((prev) =>
                            prev.filter((_, fileIdx) => fileIdx !== idx)
                          );
                          setUploadProgress((prev) =>
                            prev.filter((_, progIdx) => progIdx !== idx)
                          );
                          setImagePreviews((prev) => {
                            const next = prev.filter((_, prevIdx) => prevIdx !== idx);
                            URL.revokeObjectURL(preview);
                            return next;
                          });
                        }}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                        aria-label="Remove image"
                      >
                        <svg
                          width="14"
                          height="14"
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
                        src={preview}
                        alt={`Cover preview ${idx + 1}`}
                        className="h-36 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Publishing...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  Publish Article
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-text-secondary transition-all hover:bg-card hover:text-text"
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </button>
          </div>

          {isSubmitting && imageFiles.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between text-xs text-text-secondary">
                <span>Uploading images…</span>
                <span>
                  {Math.round(
                    uploadProgress.reduce((sum, p) => sum + p, 0) /
                      uploadProgress.length
                  )}%
                </span>
              </div>
              <div className="grid gap-3">
                {imageFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="grid gap-1">
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span className="truncate">{file.name}</span>
                      <span>{uploadProgress[idx] ?? 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-bg">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${uploadProgress[idx] ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Live Preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-secondary">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Live Preview
              </h3>

              {title || excerpt ? (
                <div className="rounded-lg border border-border bg-bg p-4">
                  <div className="mb-3 h-32 w-full rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30" />
                  {league && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {category || "Uncategorized"}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {league}
                      </span>
                    </div>
                  )}
                  <h4 className="mb-2 text-sm font-bold leading-snug text-text">
                    {title || "Your headline appears here..."}
                  </h4>
                  <p className="mb-3 text-xs leading-relaxed text-text-secondary">
                    {excerpt || "Your summary will appear here..."}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                    {author && (
                      <>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[8px] font-bold text-primary">
                          {author.charAt(0)}
                        </div>
                        <span>{author}</span>
                        <span className="text-border">•</span>
                      </>
                    )}
                    <span>Just now</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="mb-2 text-text-secondary"
                  >
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                  </svg>
                  <p className="text-xs text-text-secondary">
                    Start writing to see preview
                  </p>
                </div>
              )}
            </div>

            {/* Writing Tips */}
            <div className="mt-4 rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-bold text-text">
                ✍️ Writing Tips
              </h3>
              <ul className="grid gap-2 text-xs text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Keep headlines clear and attention-grabbing
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Include who, what, when, where in your summary
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Add quotes and statistics for credibility
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  Use a high-quality cover image
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Preview */}
      {showPreview && (
        <div className="mt-6 lg:hidden">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
              Preview
            </h3>
            {title || excerpt ? (
              <div className="rounded-lg border border-border bg-bg p-4">
                <div className="mb-3 h-40 w-full rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30" />
                {league && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {category || "Uncategorized"}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {league}
                    </span>
                  </div>
                )}
                <h4 className="mb-2 font-bold leading-snug text-text">
                  {title || "Your headline appears here..."}
                </h4>
                <p className="mb-3 text-sm leading-relaxed text-text-secondary">
                  {excerpt || "Your summary will appear here..."}
                </p>
                {author && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                      {author.charAt(0)}
                    </div>
                    <span>{author}</span>
                    <span className="text-border">•</span>
                    <span>Just now</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">
                Start writing to see preview
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
