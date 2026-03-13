import NewsCard from "../../components/NewsCard";
import { fetchNewsFromApi } from "../../lib/news";
import { slugify } from "../../lib/slug";

function displayNameFromSlug(slug: string): string {
  const cleaned = slug
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ChannelPage({
  params,
}: {
  params: { slug: string };
}) {
  const allNews = await fetchNewsFromApi();
  const decoded = decodeURIComponent(params.slug);

  const authors = Array.from(new Set(allNews.map((a) => a.author)));
  const matchedAuthor = authors.find((a) => slugify(a) === decoded);

  const channelName = matchedAuthor ?? displayNameFromSlug(decoded) ?? "Kuas24";

  const channelPosts = allNews
    .filter((a) => (matchedAuthor ? a.author === matchedAuthor : true))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-5xl">
      {/* Channel header */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-xl font-bold text-primary">
              {channelName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text sm:text-2xl">
                {channelName}
              </h1>
              <p className="text-sm text-text-secondary">
                Football channel • {channelPosts.length} posts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover">
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* Ads + posts */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          

          <div className="grid gap-3">
            {channelPosts.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-secondary">
                About
              </h3>
              <p className="text-sm leading-relaxed text-text">
                Updates, previews, and breaking stories from {channelName}.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-bg p-3 text-center">
                  <p className="text-lg font-bold text-text">{channelPosts.length}</p>
                  <p className="text-[11px] text-text-secondary">Posts</p>
                </div>
                <div className="rounded-xl bg-bg p-3 text-center">
                  <p className="text-lg font-bold text-primary">12.4k</p>
                  <p className="text-[11px] text-text-secondary">Followers</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
