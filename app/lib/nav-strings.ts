"use client";

import { useLocale } from "./locale";

export interface NavStrings {
  nav: {
    news: string;
    fixtures: string;
    predict: string;
    favorites: string;
    profile: string;
    postNews: string;
    post: string;
  };
  footer: {
    tagline: string;
    description: string;
    explore: string;
    legal: string;
    home: string;
    football: string;
    basketball: string;
    liveScores: string;
    privacyPolicy: string;
    termsAndConditions: string;
    aboutUs: string;
    ctaTitle: string;
    ctaBody: string;
    stayUpdated: string;
    allRightsReserved: string;
    builtForFans: string;
  };
  dates: {
    today: string;
    yesterday: string;
    tomorrow: string;
  };
}

const en: NavStrings = {
  nav: {
    news: "News",
    fixtures: "Fixtures",
    predict: "Predict",
    favorites: "Favorites",
    profile: "Profile",
    postNews: "Post News",
    post: "Post",
  },
  footer: {
    tagline: "Sports News • Live Scores",
    description:
      "Stay ahead of every kickoff, transfer, fixture, and breaking story. Personalized sports coverage built for passionate fans around the world.",
    explore: "Explore",
    legal: "Legal",
    home: "Home",
    football: "Football",
    basketball: "Basketball",
    liveScores: "Live Scores",
    privacyPolicy: "Privacy Policy",
    termsAndConditions: "Terms & Conditions",
    aboutUs: "About Us",
    ctaTitle: "Never Miss a Match ⚽",
    ctaBody:
      "Get breaking news, fixtures, live scores, transfers, and match highlights as soon as they happen.",
    stayUpdated: "Stay Updated",
    allRightsReserved: "All rights reserved.",
    builtForFans: "Built for sports fans",
  },
  dates: {
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
  },
};

const am: NavStrings = {
  nav: {
    news: "ዜና",
    fixtures: "ጨዋታዎች",
    predict: "ትንበያ",
    favorites: "ተወዳጆች",
    profile: "መገለጫ",
    postNews: "ዜና ለጥፍ",
    post: "ለጥፍ",
  },
  footer: {
    tagline: "የስፖርት ዜና • ቀጥታ ውጤቶች",
    description:
      "የእያንዳንዱን ጨዋታ መነሻ፣ ሽግግር፣ ፋይክሸር እና ወቅታዊ ዜና ይከታተሉ። ለእውነተኛ የስፖርት ደጋፊዎች የተሰራ ግላዊ ሽፋን።",
    explore: "ያስሱ",
    legal: "ህጋዊ",
    home: "መነሻ",
    football: "እግር ኳስ",
    basketball: "ቅርጫት ኳስ",
    liveScores: "ቀጥታ ውጤቶች",
    privacyPolicy: "የግላዊነት ፖሊሲ",
    termsAndConditions: "ደንቦች እና ሁኔታዎች",
    aboutUs: "ስለ እኛ",
    ctaTitle: "ምንም ጨዋታ እንዳያመልጥዎት ⚽",
    ctaBody:
      "ወቅታዊ ዜና፣ ጨዋታዎች፣ ቀጥታ ውጤቶች፣ ሽግግሮች እና የጨዋታ ማጠቃለያዎች በሚከሰቱበት ጊዜ ይቀበሉ።",
    stayUpdated: "ዝመና ይኑ",
    allRightsReserved: "ሁሉም መብቶች የተጠበቁ ናቸው።",
    builtForFans: "ለስፖርት ደጋፊዎች የተሰራ",
  },
  dates: {
    today: "ዛሬ",
    yesterday: "ትላንት",
    tomorrow: "ነገ",
  },
};

export function useNavStrings(): NavStrings {
  const { locale } = useLocale();
  return locale === "am" ? am : en;
}
