"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { forgotPassword } from "../lib/auth-api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({ phone });
      sessionStorage.setItem("auth-reset-phone", phone.trim());
      router.push(`/verify-otp?phone=${encodeURIComponent(phone.trim())}`);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to send OTP right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-8 sm:py-12">
      <div className="w-full rounded-3xl border border-border bg-card/95 p-6 shadow-[0_30px_90px_-60px_rgba(11,18,32,0.85)] backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold text-text">Forgot password</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter your phone number and we will send an OTP code.
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
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          Back to{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
