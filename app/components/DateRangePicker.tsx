"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatRelativeDayLabel } from "../lib/date-format";
import { useDateFormat } from "../lib/date-format";
import { useNavStrings } from "../lib/nav-strings";
import { ETH_WEEKDAYS_AM } from "../lib/ethiopian-date";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatGregorianKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DateRangePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  rangeBefore?: number;
  rangeAfter?: number;
  showAllOption?: boolean;
}

export default function DateRangePicker({
  selected,
  onChange,
  rangeBefore = 7,
  rangeAfter = 7,
  showAllOption = false,
}: DateRangePickerProps) {
  const strings = useNavStrings();
  const { locale, formatDate, calendarDay } = useDateFormat();
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const selectedDate = selected ?? today;

  useEffect(() => {
    setCalendarMonth(selectedDate);
  }, [selectedDate]);

  const dates = useMemo(() => {
    return Array.from({ length: rangeBefore + rangeAfter + 1 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - rangeBefore + index);
      return date;
    });
  }, [today, rangeBefore, rangeAfter]);

  const selectedKey = selected ? formatGregorianKey(selected) : null;

  useEffect(() => {
    if (!scrollRef.current || !selectedKey) return;
    const button = scrollRef.current.querySelector<HTMLButtonElement>(`button[data-date="${selectedKey}"]`);
    if (button) {
      scrollRef.current.scrollTo({ left: button.offsetLeft - scrollRef.current.clientWidth / 2 + button.clientWidth / 2, behavior: "smooth" });
    }
  }, [selectedKey]);

  const focusDateButton = (direction: -1 | 1) => {
    if (!scrollRef.current) return;
    const buttons = Array.from(scrollRef.current.querySelectorAll<HTMLButtonElement>("button[data-date]"));
    const activeIndex = buttons.findIndex((button) => button === document.activeElement);
    if (activeIndex === -1) return;
    const targetIndex = activeIndex + direction;
    if (targetIndex < 0 || targetIndex >= buttons.length) return;
    buttons[targetIndex].focus();
    buttons[targetIndex].scrollIntoView({ inline: "center", behavior: "smooth" });
  };

  const handleScrollKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusDateButton(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusDateButton(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      const buttons = Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>("button[data-date]") ?? []);
      buttons[0]?.focus();
      buttons[0]?.scrollIntoView({ inline: "center", behavior: "smooth" });
    } else if (event.key === "End") {
      event.preventDefault();
      const buttons = Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>("button[data-date]") ?? []);
      buttons.at(-1)?.focus();
      buttons.at(-1)?.scrollIntoView({ inline: "center", behavior: "smooth" });
    }
  };

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIdx = calendarMonth.getMonth();
  const firstDayOfMonth = new Date(calendarYear, calendarMonthIdx, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();
  const calendarDays: (Date | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(calendarYear, calendarMonthIdx, index + 1)),
  ];

  const handleDateChange = (date: Date | null) => {
    onChange(date);
    setShowCalendar(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {showAllOption && (
          <button
            type="button"
            onClick={() => handleDateChange(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              selected === null ? "bg-primary text-white" : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
            }`}
          >
            All dates
          </button>
        )}

        <div className="relative flex-1 min-w-0">
          <div
            ref={scrollRef}
            tabIndex={0}
            role="listbox"
            aria-label="Fixture date picker"
            onKeyDown={handleScrollKeyDown}
            className="hide-scrollbar flex w-full flex-nowrap gap-1.5 overflow-x-auto rounded-3xl border border-border bg-surface px-1.5 py-1.5 sm:gap-2 sm:px-2 sm:py-2"
          >
            <button
              type="button"
              onClick={() => setShowCalendar((current) => !current)}
              className="snap-center flex min-w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card px-2 py-2 text-text-secondary transition-colors hover:bg-card-hover hover:text-text focus:outline-none focus:ring-2 focus:ring-primary sm:min-w-17"
              aria-label="Open calendar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
            </button>
            {dates.map((date) => {
              const key = formatGregorianKey(date);
              const isSelected = selectedKey === key;
              const isToday = sameDay(date, today);
              return (
                <button
                  key={key}
                  type="button"
                  data-date={key}
                  onClick={() => handleDateChange(new Date(date))}
                  className={`snap-center flex shrink-0 flex-col items-center rounded-2xl px-2 py-1.5 text-left transition-all min-w-12 sm:min-w-17 sm:px-3 sm:py-2 ${
                    isSelected
                      ? "bg-primary text-white"
                      : isToday
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "bg-card text-text-secondary hover:bg-card-hover hover:text-text"
                  }`}
                >
                  <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] sm:tracking-[0.08em]">
                    {formatRelativeDayLabel(date, locale, strings.dates)}
                  </span>
                  <span className="mt-0.5 whitespace-nowrap text-[11px] font-bold sm:mt-1 sm:text-sm">
                    {formatDate(date, "short")}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowCalendar((current) => !current)}
              className="snap-center flex min-w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card px-2 py-2 text-text-secondary transition-colors hover:bg-card-hover hover:text-text focus:outline-none focus:ring-2 focus:ring-primary sm:min-w-17"
              aria-label="Open calendar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showCalendar && (
        <div className="absolute left-0 z-20 mt-3 w-[min(420px,100vw)] rounded-3xl border border-border bg-card p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIdx - 1, 1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary transition-colors hover:bg-card-hover hover:text-text"
              aria-label="Previous month"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="text-sm font-semibold text-text">
              {formatDate(calendarMonth, "monthYear")}
            </div>
            <button
              type="button"
              onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIdx + 1, 1))}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary transition-colors hover:bg-card-hover hover:text-text"
              aria-label="Next month"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-text-secondary">
            {(locale === "am" ? ETH_WEEKDAYS_AM.map((day) => day.slice(0, 2)) : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mt-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-10" />;
              }
              const key = formatGregorianKey(day);
              const isToday = sameDay(day, today);
              const isSelectedDay = selectedKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateChange(new Date(day))}
                  className={`h-10 rounded-2xl transition-colors ${
                    isSelectedDay
                      ? "bg-primary text-white"
                      : isToday
                      ? "bg-primary/10 text-primary"
                      : "text-text hover:bg-card-hover"
                  }`}
                >
                  {calendarDay(day)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
