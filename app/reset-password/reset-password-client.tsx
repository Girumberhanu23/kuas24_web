"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { resetPassword } from "../lib/auth-api";
import { useAuthStrings } from "../lib/auth-strings";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const strings = useAuthStrings();

  const initialPhone = useMemo(() => {
    const fromQuery = searchParams.get("phone")?.trim();
    if (fromQuery) return fromQuery;

    return sessionStorage.getItem("auth-reset-phone")?.trim() || "";
  }, [searchParams]);

  const initialCode = useMemo(() => {
    const fromQuery = searchParams.get("code")?.trim();
    if (fromQuery) return fromQuery;

    return sessionStorage.getItem("auth-reset-code")?.trim() || "";
  }, [searchParams]);

  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError(strings.reset.requiredPhone);
      return;
    }

    if (!code.trim()) {
      setError(strings.reset.requiredCode);
      return;
    }

    if (newPassword.length < 8) {
      setError(strings.reset.passwordLength);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ phone, code, newPassword });
      sessionStorage.removeItem("auth-reset-phone");
      sessionStorage.removeItem("auth-reset-code");
      router.push("/login");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : strings.reset.resetError;
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-8 sm:py-12">
      <div className="w-full rounded-3xl border border-border bg-card/95 p-6 shadow-[0_30px_90px_-60px_rgba(11,18,32,0.85)] backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold text-text">{strings.reset.title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{strings.reset.subtitle}</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.reset.phoneLabel}</span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={strings.reset.phonePlaceholder}
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.reset.codeLabel}</span>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={strings.reset.codePlaceholder}
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.reset.passwordLabel}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={strings.reset.passwordPlaceholder}
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
            {isSubmitting ? strings.reset.submitting : strings.reset.button}
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          {strings.reset.returnTo}{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover"
          >
            {strings.reset.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
