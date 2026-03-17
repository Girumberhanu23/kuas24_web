import { API_BASE_URL } from "./api";
import type { NewsArticle } from "./types";

interface ApiNewsPost {
  _id: string;
  id?: string;
  broadcasterId?: { _id: string; name: string } | null;
  title: string;
  shortSummary?: string;
  fullArticle?: string;
  images?: string[];
  category: string | null;
  pollOptions?: string[];
  tags?: string[];
  isHeadline: boolean;
  createdAt?: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  author?: string;
  headline?: boolean;
  featured?: boolean;
}

const NEWS_FETCH_TIMEOUT_MS = 3500;

function mapApiToNewsArticle(post: ApiNewsPost, index: number): NewsArticle {
  const gradients = [
    "from-blue-600 to-purple-700",
    "from-red-600 to-pink-600",
    "from-blue-800 to-red-700",
    "from-green-600 to-blue-500",
    "from-amber-500 to-red-600",
    "from-rose-600 to-fuchsia-700",
  ];

  const league = post.tags?.[0] || "International";
  const imageList = post.images ?? [];

  return {
    id: post._id || post.id || `news-${index}`,
    title: post.title,
    excerpt: post.shortSummary || post.summary || post.excerpt || "",
    content: post.fullArticle || post.content || "",
    category: post.category || "General",
    league,
    author: post.broadcasterId?.name || post.author || "Kuas24",
    date: post.createdAt || new Date().toISOString(),
    imageGradient: gradients[index % gradients.length],
    imageUrl: imageList[0] || post.image || undefined,
    featured: post.isHeadline ?? post.headline ?? post.featured ?? false,
  };
}

function getNewsPostsFromPayload(payload: unknown): ApiNewsPost[] {
  if (Array.isArray(payload)) return payload as ApiNewsPost[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const directLists = [record.newsPosts, record.posts, record.news];

  for (const list of directLists) {
    if (Array.isArray(list)) return list as ApiNewsPost[];
  }

  if (record.data && typeof record.data === "object") {
    const nested = getNewsPostsFromPayload(record.data);
    if (nested.length > 0) return nested;
  }

  if (record.result && typeof record.result === "object") {
    const nested = getNewsPostsFromPayload(record.result);
    if (nested.length > 0) return nested;
  }

  if (Array.isArray(record.items)) {
    return record.items as ApiNewsPost[];
  }

  return [];
}

export async function fetchNewsFromApi(): Promise<NewsArticle[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NEWS_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}news/getNews`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return [];

    const data = (await response.json()) as unknown;
    const posts = getNewsPostsFromPayload(data);

    if (!posts.length) return [];
    return posts.map(mapApiToNewsArticle);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
