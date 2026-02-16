import { NewsArticle, Fixture, LeagueCategory } from "./types";

export const leagueCategories: LeagueCategory[] = [
  { id: "all", name: "All Leagues" },
  { id: "Premier League", name: "Premier League" },
  { id: "La Liga", name: "La Liga" },
  { id: "Serie A", name: "Serie A" },
  { id: "Bundesliga", name: "Bundesliga" },
  { id: "Ligue 1", name: "Ligue 1" },
  { id: "Champions League", name: "Champions League" },
  { id: "International", name: "International" },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Champions League Quarter-Finals Draw Revealed",
    excerpt:
      "The draw for the UEFA Champions League quarter-finals has been completed, setting up some blockbuster matchups for football fans worldwide.",
    content:
      "The draw for the UEFA Champions League quarter-finals has been completed, setting up some blockbuster matchups for football fans worldwide. Real Madrid will face Manchester City in a repeat of last season's semi-final, while Bayern Munich takes on Arsenal in what promises to be a thrilling encounter.",
    category: "Champions League",
    league: "Champions League",
    author: "James Rodriguez",
    date: "2026-02-09",
    imageGradient: "from-blue-600 to-purple-700",
    featured: true,
  },
  {
    id: "2",
    title: "Premier League Title Race Heats Up with Manchester Derby",
    excerpt:
      "Manchester United and Manchester City face off in a crucial derby that could decide the Premier League title.",
    content:
      "The Manchester Derby is set to be the biggest game of the Premier League season as both teams sit within two points of each other at the top of the table. City's recent form has been questioned while United have won their last 8 matches.",
    category: "Premier League",
    league: "Premier League",
    author: "David Thompson",
    date: "2026-02-09",
    imageGradient: "from-red-600 to-pink-600",
    featured: false,
  },
  {
    id: "3",
    title: "Transfer Window: PSG Signs Rising Brazilian Wonderkid",
    excerpt:
      "Paris Saint-Germain have completed the signing of 18-year-old Brazilian sensation Endrick from Real Madrid on loan.",
    content:
      "Paris Saint-Germain have completed a stunning loan deal for Brazilian wonderkid Endrick from Real Madrid. The 18-year-old forward will join PSG for the remainder of the season with an option to buy.",
    category: "Transfers",
    league: "Ligue 1",
    author: "Pierre Dubois",
    date: "2026-02-03",
    imageGradient: "from-blue-800 to-red-700",
    featured: false,
  },
  {
    id: "4",
    title: "World Cup 2026 Stadiums Pass Final Inspections",
    excerpt:
      "All 16 venues for the 2026 FIFA World Cup have passed their final readiness inspections.",
    content:
      "FIFA has confirmed that all 16 stadiums across the USA, Mexico, and Canada have passed their final readiness inspections ahead of the 2026 World Cup. The tournament is set to be the largest in history with 48 teams.",
    category: "World Cup",
    league: "International",
    author: "Anna Schmidt",
    date: "2026-02-01",
    imageGradient: "from-green-600 to-blue-500",
    featured: false,
  },
  {
    id: "5",
    title: "El Clasico Preview: Madrid and Barca Set for Another Classic",
    excerpt:
      "Real Madrid host Barcelona in a massive La Liga clash with the title race on the line.",
    content:
      "Real Madrid host Barcelona in a massive La Liga clash with the title race on the line. Both teams come into the fixture in strong form, and tactical adjustments in midfield could decide the outcome.",
    category: "La Liga",
    league: "La Liga",
    author: "Luis Ortega",
    date: "2026-02-10",
    imageGradient: "from-amber-500 to-red-600",
    featured: true,
  },
  {
    id: "6",
    title: "Derby d'Italia: Milan Rivalry Renews in Serie A Showdown",
    excerpt:
      "Inter and AC Milan meet again in a high-stakes Serie A derby.",
    content:
      "Inter and AC Milan meet again in a high-stakes Serie A derby. With both sides pushing for the top spots, expect a physical battle and fast transitions.",
    category: "Serie A",
    league: "Serie A",
    author: "Marco Bianchi",
    date: "2026-02-11",
    imageGradient: "from-rose-600 to-fuchsia-700",
    featured: false,
  },
];

export const fixtures: Fixture[] = [
  // Premier League
  {
    id: "f1",
    league: "Premier League",
    homeTeam: "Manchester United",
    awayTeam: "Manchester City",
    homeScore: 2,
    awayScore: 1,
    time: "20:00",
    status: "live",
    minute: "67'",
  },
  {
    id: "f2",
    league: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeScore: 0,
    awayScore: 0,
    time: "17:30",
    status: "live",
    minute: "23'",
  },
  {
    id: "f3",
    league: "Premier League",
    homeTeam: "Liverpool",
    awayTeam: "Tottenham",
    homeScore: 3,
    awayScore: 1,
    time: "15:00",
    status: "finished",
  },
  {
    id: "f4",
    league: "Premier League",
    homeTeam: "Newcastle",
    awayTeam: "Aston Villa",
    homeScore: null,
    awayScore: null,
    time: "20:45",
    status: "upcoming",
  },
  // La Liga
  {
    id: "f5",
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeScore: 1,
    awayScore: 2,
    time: "21:00",
    status: "live",
    minute: "78'",
  },
  {
    id: "f6",
    league: "La Liga",
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    homeScore: 2,
    awayScore: 0,
    time: "18:30",
    status: "finished",
  },
  // Serie A
  {
    id: "f7",
    league: "Serie A",
    homeTeam: "AC Milan",
    awayTeam: "Inter Milan",
    homeScore: 1,
    awayScore: 1,
    time: "20:45",
    status: "live",
    minute: "55'",
  },
  {
    id: "f8",
    league: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "Napoli",
    homeScore: null,
    awayScore: null,
    time: "18:00",
    status: "upcoming",
  },
  // Bundesliga
  {
    id: "f9",
    league: "Bundesliga",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    homeScore: 2,
    awayScore: 2,
    time: "18:30",
    status: "live",
    minute: "61'",
  },
  // Ligue 1
  {
    id: "f10",
    league: "Ligue 1",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    homeScore: null,
    awayScore: null,
    time: "21:00",
    status: "upcoming",
  },
];
