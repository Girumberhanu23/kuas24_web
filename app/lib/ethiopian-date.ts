export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

const ETHIOPIAN_EPOCH = 1723856;

export const ETH_MONTHS_AM = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜን",
] as const;

export const ETH_WEEKDAYS_AM = [
  "እሑድ",
  "ሰኞ",
  "ማክሰ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
] as const;

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function gregorianToEthiopian(date: Date): EthiopianDate {
  const jdn = gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const r = (jdn - ETHIOPIAN_EPOCH) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - ETHIOPIAN_EPOCH) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

function getEthiopiaHourMinute(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Addis_Ababa",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return { hour, minute };
}

/** Ethiopian clock: the day starts at 6:00 AM EAT (7:00 AM = 1:00). */
export function formatEthiopianTime(date: Date): string {
  const { hour, minute } = getEthiopiaHourMinute(date);
  const ethHour = ((hour + 6) % 12) || 12;
  const period = hour >= 6 && hour < 18 ? "ቀን" : "ሌሊት";
  return `${ethHour}:${String(minute).padStart(2, "0")} ${period}`;
}

export function getEthiopianWeekday(date: Date): string {
  return ETH_WEEKDAYS_AM[date.getDay()];
}

export function getEthiopianMonthName(month: number): string {
  return ETH_MONTHS_AM[month - 1] ?? "";
}
