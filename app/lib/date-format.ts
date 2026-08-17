"use client";

import type { Locale } from "./locale";
import { useLocale } from "./locale";
import {
  formatEthiopianTime,
  getEthiopianMonthName,
  getEthiopianWeekday,
  gregorianToEthiopian,
} from "./ethiopian-date";

export type DateFormatStyle =
  | "short"
  | "medium"
  | "long"
  | "weekdayShort"
  | "monthYear"
  | "dayMonth";

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatGregorianDate(date: Date, style: DateFormatStyle): string {
  switch (style) {
    case "short":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "medium":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    case "long":
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "weekdayShort":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "monthYear":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "dayMonth":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    default:
      return date.toLocaleDateString("en-US");
  }
}

function formatEthiopianDate(date: Date, style: DateFormatStyle): string {
  const eth = gregorianToEthiopian(date);
  const month = getEthiopianMonthName(eth.month);
  const weekday = getEthiopianWeekday(date);

  switch (style) {
    case "short":
      return `${month} ${eth.day}`;
    case "medium":
      return `${weekday} ${month} ${eth.day}`;
    case "long":
      return `${weekday} ${month} ${eth.day} ${eth.year}`;
    case "weekdayShort":
      return weekday;
    case "monthYear":
      return `${month} ${eth.year}`;
    case "dayMonth":
      return `${eth.day} ${month}`;
    default:
      return `${month} ${eth.day} ${eth.year}`;
  }
}

export function formatLocaleDate(
  value: Date | string,
  locale: Locale,
  style: DateFormatStyle = "medium",
): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return locale === "am" ? formatEthiopianDate(date, style) : formatGregorianDate(date, style);
}

export function formatLocaleTime(value: Date | string, locale: Locale): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  if (locale === "am") return formatEthiopianTime(date);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatLocaleYear(value: Date | string, locale: Locale): string {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return String(new Date().getFullYear());
  if (locale === "am") return String(gregorianToEthiopian(date).year);
  return String(date.getFullYear());
}

export function getLocaleCalendarDay(value: Date | string, locale: Locale): number {
  const date = toDate(value);
  if (locale === "am") return gregorianToEthiopian(date).day;
  return date.getDate();
}

export function formatRelativeDayLabel(
  date: Date,
  locale: Locale,
  labels: { today: string; yesterday: string; tomorrow: string },
): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return labels.today;
  if (sameDay(date, tomorrow)) return labels.tomorrow;
  if (sameDay(date, yesterday)) return labels.yesterday;
  return formatLocaleDate(date, locale, "weekdayShort");
}

export function useDateFormat() {
  const { locale } = useLocale();

  return {
    locale,
    formatDate: (value: Date | string, style?: DateFormatStyle) =>
      formatLocaleDate(value, locale, style),
    formatTime: (value: Date | string) => formatLocaleTime(value, locale),
    formatYear: (value?: Date | string) =>
      formatLocaleYear(value ?? new Date(), locale),
    calendarDay: (value: Date | string) => getLocaleCalendarDay(value, locale),
  };
}
