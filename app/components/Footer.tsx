"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";

const links = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/about-us", label: "About Us" },
] as const;

const socials = [
  { href: "https://facebook.com", Icon: FaFacebookF, label: "Facebook" },
  { href: "https://x.com", Icon: FaXTwitter, label: "X" },
  { href: "https://instagram.com", Icon: FaInstagram, label: "Instagram" },
  { href: "https://www.tiktok.com/@kuas24?is_from_webapp=1&sender_device=pc", Icon: FaTiktok, label: "Tiktok" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Kuas24 Logo"
                width={48}
                height={48}
                className="rounded-2xl"
              />

              <div>
                <h2 className="text-lg font-bold text-text">
                  Kuas24
                </h2>
                <p className="text-xs text-text-secondary">
                  Sports News Platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-text-secondary">
              Personalized sports news, live fixtures, match updates,
              and the stories that matter most to fans.
            </p>

            <div className="mt-6 flex gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-card border border-border text-text-secondary transition-all duration-200 hover:-translate-y-1 hover:text-primary hover:border-primary/30"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          {/* Join Kuas24 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text">
              Join Kuas24
            </h3>

            <p className="mb-4 text-sm text-text-secondary">
              Create a free account to follow your favorite clubs, save articles,
              and get personalized football news.
            </p>

            <Link
              href="/login"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-primary
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition-all
                hover:opacity-90
                hover:shadow-lg
                hover:shadow-primary/20
              "
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col gap-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
            <p>© {year} Kuas24. All rights reserved.</p>

            <div className="flex flex-wrap gap-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-24 md:hidden" aria-hidden="true" />
    </footer>
  );
}