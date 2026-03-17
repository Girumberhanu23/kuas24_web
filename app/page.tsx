import HomeClient from "./home-client";
import { fetchNewsFromApi } from "./lib/news";

export default async function Home() {
  const news = await fetchNewsFromApi();
  return <HomeClient initialNews={news} />;
}
