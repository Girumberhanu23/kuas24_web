"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { loginUser } from "../lib/auth-api";
import { setAuthSessionFromLoginResponse } from "../lib/auth";
import { useAuthStrings } from "../lib/auth-strings";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const strings = useAuthStrings();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError(strings.login.requiredPhone);
      return;
    }

    if (password.length < 4) {
      setError(strings.login.passwordLength);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await loginUser({ phone, password });
      const session = setAuthSessionFromLoginResponse(payload);

      if (!session) {
        throw new Error(strings.login.loginSuccessIncomplete);
      }

      const nextUrl = searchParams.get("next") ?? "/";
      router.push(nextUrl);
      router.refresh();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : strings.login.loginError;
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-8 sm:py-12">
      <div className="w-full rounded-3xl border border-border bg-card/95 p-6 shadow-[0_30px_90px_-60px_rgba(11,18,32,0.85)] backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold text-text">{strings.login.title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{strings.login.subtitle}</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.login.phoneLabel}</span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={strings.login.phonePlaceholder}
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.login.passwordLabel}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={strings.login.passwordPlaceholder}
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? strings.login.submitting : strings.login.button}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
            {strings.login.forgotPassword}
          </Link>
          <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
            {strings.login.createAccount}
          </Link>
        </div>
      </div>
    </div>
  );
}
