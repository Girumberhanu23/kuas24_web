"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { verifyOtp } from "../lib/auth-api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = useMemo(() => {
    const fromQuery = searchParams.get("phone")?.trim();
    if (fromQuery) return fromQuery;

    if (typeof window !== "undefined") {
      const fromStorage = sessionStorage.getItem("auth-reset-phone")?.trim();
      if (fromStorage) return fromStorage;
    }

    return "";
  }, [searchParams]);

  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (code.trim().length < 4) {
      setError("OTP code is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOtp({ phone, code });
      const normalizedPhone = phone.trim();
      const normalizedCode = code.trim();
      sessionStorage.setItem("auth-reset-phone", normalizedPhone);
      sessionStorage.setItem("auth-reset-code", normalizedCode);
      router.push(
        `/reset-password?phone=${encodeURIComponent(normalizedPhone)}&code=${encodeURIComponent(normalizedCode)}`
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unable to verify OTP.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-8 sm:py-12">
      <div className="w-full rounded-3xl border border-border bg-card/95 p-6 shadow-[0_30px_90px_-60px_rgba(11,18,32,0.85)] backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold text-text">Verify OTP</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter the verification code sent to your phone.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">Phone Number</span>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="09XXXXXXXX"
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">OTP Code</span>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="6-digit code"
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm tracking-[0.15em] text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
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
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          Didn&apos;t receive code? Return to{" "}
          <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
}
