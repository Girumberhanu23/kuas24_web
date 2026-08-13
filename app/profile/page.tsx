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
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="group w-full rounded-full border border-red-400/30 bg-gradient-to-r from-red-500/10 to-rose-500/10 px-5 py-3 text-sm font-semibold text-red-200 shadow-sm shadow-red-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400/50 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-rose-500/20 hover:shadow-md hover:shadow-red-950/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoggingOut ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200/30 border-t-red-200" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
                      />
                    </svg>
                    Logout
                  </>
                )}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-hover px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
            >
              Sign in
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
