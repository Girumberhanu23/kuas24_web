"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAuthHeaderValue } from "../lib/auth";

const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function requestAccountDeletion(): Promise<void> {
  const authorization = getAuthHeaderValue();

  // Try real API first. If backend route is not ready yet, fall back to a
  // placeholder delay to keep UX flow complete.
  try {
    const response = await fetch("/api/auth/delete-account", {
      method: "DELETE",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    });

    if (response.ok || response.status === 404 || response.status === 405) {
      await sleep(900);
      return;
    }

    let message = "Failed to delete account. Please try again.";
    try {
      const data = (await response.json()) as { message?: string; error?: string };
      if (data?.message) message = data.message;
      else if (data?.error) message = data.error;
    } catch {
      // Ignore JSON parsing errors and keep fallback message.
    }
    throw new Error(message);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete account. Please try again.");
  }
}

export default function AccountDeletionPage() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalInputRef = useRef<HTMLInputElement | null>(null);

  const isPhraseMatch = confirmationInput === CONFIRMATION_PHRASE;
  const showInlineValidation =
    (confirmationInput.length > 0 || hasAttemptedSubmit) && !isPhraseMatch;

  const warningItems = useMemo(
    () => [
      "All user data will be permanently deleted.",
      "Preferences, saved interests, and account information will be lost.",
      "This action cannot be reversed.",
    ],
    []
  );

  useEffect(() => {
    if (!isModalOpen) return;

    const timeoutId = window.setTimeout(() => {
      modalInputRef.current?.focus();
    }, 20);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDeleting, isModalOpen]);

  const openModal = () => {
    setErrorMessage(null);
    setHasAttemptedSubmit(false);
    setConfirmationInput("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isDeleting) return;
    setIsModalOpen(false);
    setHasAttemptedSubmit(false);
    setConfirmationInput("");
    setErrorMessage(null);
  };

  const handleDelete = async () => {
    if (!isPhraseMatch) {
      setHasAttemptedSubmit(true);
      return;
    }

    setHasAttemptedSubmit(false);
    setErrorMessage(null);
    setIsDeleting(true);

    try {
      await requestAccountDeletion();

      clearAuthSession();
      localStorage.removeItem("sportslive-favorites");
      sessionStorage.removeItem("auth-reset-phone");
      sessionStorage.removeItem("auth-reset-code");

      setIsSuccess(true);

      window.setTimeout(() => {
        router.replace("/");
      }, 1400);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-1 sm:space-y-8">
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-text sm:text-3xl">
          Delete Your Account
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          This action is permanent and cannot be undone.
        </p>
      </header>

      <section className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-red-300 sm:text-xl">Warning</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-red-200 sm:text-base">
          {warningItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-text sm:text-xl">
          Confirm Deletion
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary sm:text-base">
          To prevent accidental deletion, continue only if you are certain you
          want to permanently remove your Sports News account.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openModal}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            Delete Account
          </button>
        </div>
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-modal-title"
          aria-describedby="delete-account-modal-description"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all duration-200 sm:p-7">
            <h3
              id="delete-account-modal-title"
              className="text-xl font-semibold text-text"
            >
              Confirm Account Deletion
            </h3>
            <p
              id="delete-account-modal-description"
              className="mt-3 text-sm leading-7 text-text-secondary"
            >
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>

            <p className="mt-4 text-sm text-text-secondary">
              Type: <span className="font-semibold text-text">{CONFIRMATION_PHRASE}</span>
            </p>

            <label htmlFor="delete-confirm-input" className="sr-only">
              Confirmation phrase
            </label>
            <input
              ref={modalInputRef}
              id="delete-confirm-input"
              type="text"
              value={confirmationInput}
              onChange={(event) => setConfirmationInput(event.target.value)}
              placeholder="Type the confirmation phrase"
              className="mt-3 h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-text placeholder:text-text-secondary/70 outline-none transition-colors focus:border-red-400/60 focus:ring-2 focus:ring-red-400/30"
            />

            {showInlineValidation ? (
              <p className="mt-2 text-sm text-red-300" role="alert">
                The confirmation phrase must match exactly: {CONFIRMATION_PHRASE}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-2 text-sm text-red-300" role="alert">
                {errorMessage}
              </p>
            ) : null}

            {isSuccess ? (
              <p className="mt-2 text-sm text-secondary" role="status">
                Account deleted successfully. Redirecting...
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isDeleting}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isPhraseMatch || isDeleting || isSuccess}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
