"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  EMPTY_OPTIONS,
  EMPTY_PREFERENCES,
  fetchPersonalizationOptions,
  fetchPersonalizationPreferences,
  savePersonalizationPreferences,
} from "../lib/personalization";
import type {
  PersonalizationOption,
  PersonalizationOptions,
  PersonalizationPreferences,
} from "../lib/types";

interface InterestsPickerProps {
  mode: "onboarding" | "profile";
  title: string;
  subtitle: string;
  submitLabel: string;
}

function OptionCard({
  option,
  selected,
  onToggle,
}: {
  option: PersonalizationOption;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      aria-pressed={selected}
      className={`group relative flex min-h-28 items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/10 shadow-[0_18px_40px_-24px_rgba(5,62,255,0.75)]"
          : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card-hover"
      }`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface">
        {option.logo ? (
          <img
            src={option.logo}
            alt={option.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-lg font-bold text-primary">
            {option.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text sm:text-base">{option.name}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-text-secondary">
          {option.type}
        </p>
      </div>

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
          selected
            ? "border-primary bg-primary text-white"
            : "border-border bg-card text-transparent group-hover:border-primary/40"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
    </button>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}

export default function InterestsPicker({
  mode,
  title,
  subtitle,
  submitLabel,
}: InterestsPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [options, setOptions] = useState<PersonalizationOptions>(EMPTY_OPTIONS);
  const [preferences, setPreferences] = useState<PersonalizationPreferences>(
    EMPTY_PREFERENCES
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedCount =
    preferences.preferredLeagues.length + preferences.preferredClubs.length;
  const hasOptions = options.leagues.length > 0 || options.clubs.length > 0;

  const loadPersonalization = async () => {
    setLoading(true);
    setError(null);

    try {
      const [fetchedOptions, fetchedPreferences] = await Promise.all([
        fetchPersonalizationOptions(),
        fetchPersonalizationPreferences().catch(() => EMPTY_PREFERENCES),
      ]);

      setOptions(fetchedOptions);
      setPreferences(fetchedPreferences);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load personalization options."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalization();
  }, []);

  const toggleLeague = (id: string) => {
    setPreferences((current) => ({
      ...current,
      preferredLeagues: current.preferredLeagues.includes(id)
        ? current.preferredLeagues.filter((entry) => entry !== id)
        : [...current.preferredLeagues, id],
    }));
    setSuccessMessage(null);
  };

  const toggleClub = (id: string) => {
    setPreferences((current) => ({
      ...current,
      preferredClubs: current.preferredClubs.includes(id)
        ? current.preferredClubs.filter((entry) => entry !== id)
        : [...current.preferredClubs, id],
    }));
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    if (selectedCount === 0) {
      setError("Select at least one league or club to continue.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedPreferences = await savePersonalizationPreferences(preferences);
      setPreferences(savedPreferences);

      if (mode === "onboarding") {
        const redirectTarget = searchParams.get("returnTo") || "/";
        router.push(redirectTarget);
        router.refresh();
        return;
      }

      setSuccessMessage("Your interests were updated.");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save your interests."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-[0_26px_80px_-48px_rgba(11,18,32,0.65)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(5,62,255,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(0,194,255,0.14),_transparent_32%)]" />

        <div className="relative">
          <div className="mb-8 flex flex-col gap-3 border-b border-border/80 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                {mode === "onboarding" ? "Onboarding" : "Profile interests"}
              </p>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-text sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                {subtitle}
              </p>
            </div>

            {mode === "profile" && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to profile
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="grid gap-8">
              <section>
                <div className="mb-4 h-6 w-28 animate-pulse rounded bg-surface" />
                <LoadingGrid />
              </section>
              <section>
                <div className="mb-4 h-6 w-24 animate-pulse rounded bg-surface" />
                <LoadingGrid />
              </section>
            </div>
          ) : !hasOptions ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <h2 className="text-xl font-semibold text-text">No interests available</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary">
                The backend did not return any leagues or clubs yet. Add options on the
                server, then reload this page.
              </p>
              <button
                type="button"
                onClick={loadPersonalization}
                className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Reload options
              </button>
            </div>
          ) : (
            <div className="grid gap-10">
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-text">Leagues</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Choose every competition you want in your feed.
                    </p>
                  </div>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                    {preferences.preferredLeagues.length} selected
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {options.leagues.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      selected={preferences.preferredLeagues.includes(option.id)}
                      onToggle={toggleLeague}
                    />
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-text">Clubs</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Add the teams you follow most closely.
                    </p>
                  </div>
                  <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                    {preferences.preferredClubs.length} selected
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {options.clubs.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      selected={preferences.preferredClubs.includes(option.id)}
                      onToggle={toggleClub}
                    />
                  ))}
                </div>
              </section>

              <div className="flex flex-col gap-4 border-t border-border/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text">
                    {selectedCount} interest{selectedCount === 1 ? "" : "s"} selected
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {mode === "onboarding"
                      ? "We will use these selections to prioritize your home feed."
                      : "Changes are saved to your profile and reused on your home feed."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={loadPersonalization}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || selectedCount === 0}
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : submitLabel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}