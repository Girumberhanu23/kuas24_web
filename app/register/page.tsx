"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerUser } from "../lib/auth-api";
import { setAuthSessionFromRegisterResponse } from "../lib/auth";
import { useAuthStrings } from "../lib/auth-strings";

export default function RegisterPage() {
  const router = useRouter();
  const strings = useAuthStrings();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError(strings.register.nameLength);
      return;
    }

    if (!phoneNumber.trim()) {
      setError(strings.register.requiredPhone);
      return;
    }

    if (password.length < 4) {
      setError(strings.register.passwordLength);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await registerUser({ name, phoneNumber, password });
      const session = setAuthSessionFromRegisterResponse(payload, phoneNumber);

      if (!session) {
        throw new Error(strings.register.registrationIncomplete);
      }

      router.push("/onboarding/interests");
      router.refresh();
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unable to register.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center py-8 sm:py-12">
      <div className="w-full rounded-3xl border border-border bg-card/95 p-6 shadow-[0_30px_90px_-60px_rgba(11,18,32,0.85)] backdrop-blur sm:p-8">
        <h1 className="text-2xl font-bold text-text">{strings.register.title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{strings.register.subtitle}</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.register.nameLabel}</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={strings.register.namePlaceholder}
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.register.phoneLabel}</span>
            <input
              type="tel"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder={strings.register.phonePlaceholder}
              className="h-11 rounded-xl border border-border bg-input px-3 text-sm text-text outline-none transition-colors placeholder:text-text-secondary/60 focus:border-primary"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text">{strings.register.passwordLabel}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={strings.register.passwordPlaceholder}
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
            {isSubmitting ? strings.register.registering : strings.register.button}
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          {strings.register.alreadyHaveAccount}{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
            {strings.register.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
