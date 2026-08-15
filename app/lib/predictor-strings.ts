"use client";

import { useLocale } from "./locale";

export interface PredictorStrings {
  pageTitle: string;
  pageSubtitle: string;
  prizeBanner: string;
  tabs: { upcoming: string; myPredictions: string; leaderboard: string };
  streak: {
    heading: string;
    days: (n: number) => string;
    globalBadge: (n: number) => string;
    longest: (n: number) => string;
    atRiskWarning: string;
    brokenTitle: (days: number) => string;
    brokenBody: string;
    restoreCta: string;
    restoring: string;
    restoreUnavailable: string;
    restoreError: string;
    countdown: (label: string) => string;
    signInCta: string;
    signInBody: string;
    signInButton: string;
  };
  fixtures: {
    empty: string;
    windowNote: string;
    pickHome: string;
    pickDraw: string;
    pickAway: string;
    picksClosed: string;
    signInToPick: string;
    signInGateBody: string;
    submitError: string;
  };
  history: {
    empty: string;
    emptyAll: string;
    emptyCorrect: string;
    emptyIncorrect: string;
    emptyPending: string;
    filterAll: string;
    filterCorrect: string;
    filterIncorrect: string;
    filterPending: string;
    pointsEarned: (n: number) => string;
    pending: string;
    correct: string;
    incorrect: string;
    signInBody: string;
  };
  leaderboard: {
    daily: string;
    weekly: string;
    allTime: string;
    rank: string;
    player: string;
    points: string;
    loadMore: string;
    empty: string;
    you: (rank: number) => string;
    youUnranked: string;
    signInGateBody: string;
    drawCountdown: (label: string) => string;
  };
  common: {
    loading: string;
    dismiss: string;
  };
}

const en: PredictorStrings = {
  pageTitle: "Match Predictor",
  pageSubtitle: "Pick winners, build your streak, climb the leaderboard",
  prizeBanner: "The #1 predictor on the weekly leaderboard wins a prize — draws happen every week.",
  tabs: { upcoming: "Upcoming", myPredictions: "My Predictions", leaderboard: "Leaderboard" },
  streak: {
    heading: "Your Streak",
    days: (n) => `${n}-day streak`,
    globalBadge: (n) => `${n}-day prediction streak`,
    longest: (n) => `Best: ${n} days`,
    atRiskWarning: "Your streak is at risk — make a pick before kickoff to keep it alive.",
    brokenTitle: (days) => `Your ${days}-day streak ended — restore it before it's gone`,
    brokenBody: "You can still bring it back if you act before the restore window closes.",
    restoreCta: "Restore streak",
    restoring: "Restoring…",
    restoreUnavailable:
      "You've already used your streak restore for this period. Check back next time your streak breaks.",
    restoreError: "Couldn't restore your streak. Please try again.",
    countdown: (label) => `Restore before it's gone: ${label}`,
    signInCta: "Sign in to start your streak",
    signInBody: "Log in to track your prediction streak and compete on the leaderboard.",
    signInButton: "Go to Login",
  },
  fixtures: {
    empty: "No fixtures available in the next 72 hours. Check back soon.",
    windowNote: "Showing fixtures kicking off in the next 72 hours",
    pickHome: "Home",
    pickDraw: "Draw",
    pickAway: "Away",
    picksClosed: "Picks closed",
    signInToPick: "Sign in to pick",
    signInGateBody: "Sign in to see upcoming fixtures and make predictions.",
    submitError: "Couldn't save your pick. Please try again.",
  },
  history: {
    empty: "You haven't made any predictions yet.",
    emptyAll: "You haven't made any predictions yet.",
    emptyCorrect: "You haven't made any correct predictions yet.",
    emptyIncorrect: "You haven't made any incorrect predictions yet.",
    emptyPending: "You don't have any pending predictions right now.",
    filterAll: "All",
    filterCorrect: "Correct",
    filterIncorrect: "Incorrect",
    filterPending: "Pending",
    pointsEarned: (n) => `+${n} pts`,
    pending: "Pending",
    correct: "Correct",
    incorrect: "Incorrect",
    signInBody: "Log in to see your prediction history.",
  },
  leaderboard: {
    daily: "Daily",
    weekly: "Weekly",
    allTime: "All-Time",
    rank: "Rank",
    player: "Player",
    points: "Points",
    loadMore: "Load more",
    empty: "No leaderboard data yet.",
    you: (rank) => `You: #${rank}`,
    youUnranked: "Keep scrolling to find your rank",
    signInGateBody: "Sign in to see the leaderboard and your rank.",
    drawCountdown: (label) => `Next draw: ${label}`,
  },
  common: {
    loading: "Loading…",
    dismiss: "Dismiss",
  },
};

const am: PredictorStrings = {
  pageTitle: "የግጥሚያ ትንበያ",
  pageSubtitle: "አሸናፊዎችን ይምረጡ፣ ተከታታይነትዎን ይገንቡ፣ በደረጃ ሰንጠረዥ ላይ ይውጡ",
  prizeBanner: "በሳምንታዊ የደረጃ ሰንጠረዥ ላይ #1 የሆነው ተንባይ ሽልማት ያሸንፋል — እጣው በየሳምንቱ ይካሄዳል።",
  tabs: { upcoming: "የሚመጡ", myPredictions: "የእኔ ትንበያዎች", leaderboard: "የደረጃ ሰንጠረዥ" },
  streak: {
    heading: "የእርስዎ ተከታታይነት",
    days: (n) => `${n} ቀን ተከታታይነት`,
    globalBadge: (n) => `${n} ቀን የትንበያ ተከታታይነት`,
    longest: (n) => `ምርጥ፦ ${n} ቀናት`,
    atRiskWarning: "ተከታታይነትዎ አደጋ ላይ ነው — ከጨዋታው መጀመሪያ በፊት ትንበያ ያድርጉ።",
    brokenTitle: (days) => `የ${days} ቀን ተከታታይነትዎ አብቅቷል — ከመጥፋቱ በፊት ይመልሱት`,
    brokenBody: "የመመለሻ መስኮቱ ከመዘጋቱ በፊት እርምጃ ከወሰዱ አሁንም መመለስ ይችላሉ።",
    restoreCta: "ተከታታይነት መልስ",
    restoring: "በመመለስ ላይ…",
    restoreUnavailable:
      "ለዚህ ወቅት የተከታታይነት መመለሻዎን አስቀድመው ተጠቅመዋል። ተከታታይነትዎ ቀጣይ ጊዜ ሲቋረጥ እንደገና ይሞክሩ።",
    restoreError: "ተከታታይነትዎን መመለስ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
    countdown: (label) => `ከመጥፋቱ በፊት ይመልሱት፦ ${label}`,
    signInCta: "ተከታታይነትዎን ለመጀመር ይግቡ",
    signInBody: "የትንበያ ተከታታይነትዎን ለመከታተል እና በደረጃ ሰንጠረዥ ላይ ለመወዳደር ይግቡ።",
    signInButton: "ወደ መግቢያ ይሂዱ",
  },
  fixtures: {
    empty: "በሚቀጥሉት 72 ሰዓታት ውስጥ ምንም ግጥሚያዎች የሉም። እባክዎ ቆይተው ይመልከቱ።",
    windowNote: "በሚቀጥሉት 72 ሰዓታት ውስጥ የሚጀምሩ ግጥሚያዎችን በማሳየት ላይ",
    pickHome: "አስተናጋጅ",
    pickDraw: "አቻ",
    pickAway: "እንግዳ",
    picksClosed: "ትንበያ ተዘግቷል",
    signInToPick: "ለመምረጥ ይግቡ",
    signInGateBody: "የሚመጡ ግጥሚያዎችን ለማየት እና ትንበያ ለማድረግ ይግቡ።",
    submitError: "ትንበያዎን ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።",
  },
  history: {
    empty: "እስካሁን ምንም ትንበያ አላደረጉም።",
    emptyAll: "እስካሁን ምንም ትንበያ አላደረጉም።",
    emptyCorrect: "እስካሁን ምንም ትክክለኛ ትንበያ አላደረጉም።",
    emptyIncorrect: "እስካሁን ምንም የተሳሳተ ትንበያ አላደረጉም።",
    emptyPending: "በአሁኑ ጊዜ ምንም በመጠባበቅ ላይ ያለ ትንበያ የለዎትም።",
    filterAll: "ሁሉም",
    filterCorrect: "ትክክል",
    filterIncorrect: "ስህተት",
    filterPending: "በመጠባበቅ ላይ",
    pointsEarned: (n) => `+${n} ነጥብ`,
    pending: "በመጠባበቅ ላይ",
    correct: "ትክክል",
    incorrect: "ስህተት",
    signInBody: "የትንበያ ታሪክዎን ለማየት ይግቡ።",
  },
  leaderboard: {
    daily: "ዕለታዊ",
    weekly: "ሳምንታዊ",
    allTime: "ከጅምሩ",
    rank: "ደረጃ",
    player: "ተጫዋች",
    points: "ነጥቦች",
    loadMore: "ተጨማሪ ይመልከቱ",
    empty: "እስካሁን የደረጃ ሰንጠረዥ መረጃ የለም።",
    you: (rank) => `እርስዎ፦ #${rank}`,
    youUnranked: "ደረጃዎን ለማግኘት መንሸራተትዎን ይቀጥሉ",
    signInGateBody: "የደረጃ ሰንጠረዡን እና ደረጃዎን ለማየት ይግቡ።",
    drawCountdown: (label) => `ቀጣይ እጣ፦ ${label}`,
  },
  common: {
    loading: "በመጫን ላይ…",
    dismiss: "አሰናብት",
  },
};

export function usePredictorStrings(): PredictorStrings {
  const { locale } = useLocale();
  return locale === "am" ? am : en;
}
