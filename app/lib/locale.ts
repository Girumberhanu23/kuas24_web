"use client";

import { useSyncExternalStore } from "react";

export type Locale = "en" | "am";

const STORAGE_KEY = "kuas24-locale";
const EVENT_NAME = "kuas24-locale";

function isValidLocale(value: string | null): value is Locale {
  return value === "en" || value === "am";
}

function getCurrentLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidLocale(saved)) return saved;
  } catch {
    // ignore
  }
  return "en";
}

export function setLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // ignore
  }
}

function subscribeLocale(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT_NAME, callback);
  };
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "en";
  return getCurrentLocale();
}

function getLocaleServerSnapshot(): Locale {
  return "en";
}

export function useLocale(): { locale: Locale; setLocale: (locale: Locale) => void } {
  const locale = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleServerSnapshot);
  return { locale, setLocale };
}
