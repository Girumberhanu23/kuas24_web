"use client";

import { useLocale, type Locale, setLocale } from "../lib/locale";

export default function LocaleToggle() {
  const { locale } = useLocale();

  const options: { id: Locale; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "am", label: "አማ" },
  ];

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={locale === option.id}
          onClick={() => setLocale(option.id)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
            locale === option.id
              ? "bg-primary text-white"
              : "text-text-secondary hover:text-text"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
