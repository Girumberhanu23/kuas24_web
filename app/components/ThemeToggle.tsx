"use client";

import { useState } from "react";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "sportslive-theme";

function getCurrentTheme(): ThemeMode {
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark") return "dark";
  if (attr === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<ThemeMode | null>(() => {
    if (typeof window === "undefined") return null;
    return getCurrentTheme();
  });

  const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => {
        const current = theme ?? getCurrentTheme();
        const updated: ThemeMode = current === "dark" ? "light" : "dark";
        setTheme(updated);
        setThemeState(updated);
      }}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-card hover:text-text"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
