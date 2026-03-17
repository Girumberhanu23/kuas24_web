import FavoritesClient from "./favorites-client";
import { fetchNewsFromApi } from "../lib/news";

export default async function FavoritesPage() {
  const allNews = await fetchNewsFromApi();

  return <FavoritesClient allNews={allNews} />;
}
