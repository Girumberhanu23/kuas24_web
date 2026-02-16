export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  league: string;
  author: string;
  date: string;
  imageGradient: string;
  featured: boolean;
}

export interface Fixture {
  id: string;
  league: string;
  leagueLogo?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  status: "live" | "finished" | "upcoming";
  minute?: string;
}

export interface LeagueCategory {
  id: string;
  name: string;
}
