import { notFound } from "next/navigation";
import { fetchNewsFromApi } from "../../lib/news";
import NewsDetailClient from "./news-detail-client";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allNews = await fetchNewsFromApi();
  const article = allNews.find((a) => a.id === id);

  if (!article) {
    notFound();
  }

  const relatedNews = allNews.filter((a) => a.id !== id);

  return <NewsDetailClient article={article} relatedNews={relatedNews} />;
}
