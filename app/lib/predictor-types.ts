export type PredictorPick = "HOME_WIN" | "DRAW" | "AWAY_WIN";

export type LeaderboardPeriod = "daily" | "weekly" | "all_time";

export interface PredictorTeam {
  id: number;
  name: string;
  logo?: string;
}

export interface PredictorLeagueRef {
  id: number;
  name: string;
  country?: string;
}

export interface PredictorFixture {
  id: string;
  apiFootballId: number;
  league: PredictorLeagueRef;
  season: number;
  homeTeam: PredictorTeam;
  awayTeam: PredictorTeam;
  kickoff: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  resolvedResult: PredictorPick | null;
  resolvedAt: string | null;
  predictionsResolved: boolean;
  userPick: PredictorPick | null;
  alreadyPicked: boolean;
}

export interface PredictorPrediction {
  id: string;
  userId: string;
  fixture: PredictorFixture | string;
  pick: PredictorPick;
  pointsAwarded: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardUserRef {
  id: string;
  phone: string;
  email: string | null;
  role: "user" | "broadcaster";
}

export interface LeaderboardEntry {
  id: string;
  user: LeaderboardUserRef;
  period: "DAILY" | "WEEKLY" | "ALL_TIME";
  points: number;
  rank: number;
  periodStart: string;
  periodEnd: string;
}

export interface PredictorPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isBroken: boolean;
  atRisk: boolean;
  restoreWindow: string | null;
  restoreAvailable: boolean;
}
