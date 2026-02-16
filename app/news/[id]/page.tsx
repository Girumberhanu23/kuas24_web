import { newsArticles } from "../../lib/data";
import type { NewsArticle } from "../../lib/types";
import NewsDetailClient from "./news-detail-client";

function createLoremArticle(id: string): NewsArticle {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  return {
    id,
    title: "Lorem Ipsum: A Football Headline Placeholder",
    excerpt:
      "This is placeholder content to preview the Kuas24 post detail design. Replace with real news when your backend is ready.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.",
    category: "Breaking",
    league: "Premier League",
    author: "Kuas24 Desk",
    date,
    imageGradient: "from-sky-500 to-blue-700",
    featured: false,
  };
}

export default function NewsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const article =
    newsArticles.find((a) => a.id === params.id) ?? createLoremArticle(params.id);

  return <NewsDetailClient article={article} />;
}
