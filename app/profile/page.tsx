"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "../lib/use-auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-[0_24px_80px_-56px_rgba(11,18,32,0.75)] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
              {user?.phone?.charAt(0) ?? "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text">Account</h1>
              <p className="mt-1 text-sm text-text-secondary">
                {isAuthenticated ? user?.phone : "Not signed in"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-bg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
              Role: {role ?? "guest"}
            </span>
            {role === "broadcaster" ? (
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                Broadcaster Access
              </span>
            ) : null}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="mt-6 rounded-2xl border border-border bg-bg px-4 py-3 text-sm text-text-secondary">
            Your session is not active. Please sign in to manage account settings.
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        <Link
          href="/profile/interests"
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-card-hover"
        >
          <div>
            <p className="text-base font-semibold text-text">Manage Interests</p>
            <p className="mt-1 text-sm text-text-secondary">
              Control leagues and clubs used for your personalized feed.
            </p>
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-secondary"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/privacy-policy"
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-card-hover"
        >
          <span className="text-base font-semibold text-text">Privacy Policy</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-secondary"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/terms-and-conditions"
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-card-hover"
        >
          <span className="text-base font-semibold text-text">Terms and Conditions</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-secondary"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>

        <Link
          href="/about-us"
          className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-card-hover"
        >
          <span className="text-base font-semibold text-text">About Us</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-text-secondary"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
