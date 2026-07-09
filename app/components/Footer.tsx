"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/about-us", label: "About Us" },
] as const;

const socialLinks = [
  { href: "https://www.facebook.com/", label: "Facebook", Icon: FaFacebookF },
  { href: "https://x.com/", label: "X (formerly Twitter)", Icon: FaXTwitter },
  { href: "https://www.instagram.com/", label: "Instagram", Icon: FaInstagram },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <section className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Kuas24 Logo"
                width={40}
                height={40}
                className="rounded-xl object-contain"
              />
              <span className="text-lg font-bold tracking-tight gradient-text">Kuas24</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-text-secondary">
              Your daily source for personalized sports news, fixtures, and the
              stories that matter most.
            </p>
            <p className="mt-4 text-xs text-text-secondary">
              Built for fans. Designed for speed.
            </p>
          </section>

          {/* Legal */}
          <nav aria-label="Legal" className="grid gap-3">
            <h2 className="text-sm font-semibold text-text">Legal</h2>
            <ul className="grid gap-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social */}
          <section className="grid gap-3">
            <h2 className="text-sm font-semibold text-text">Follow</h2>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text-secondary transition-colors hover:text-primary hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Kuas24. All rights reserved.</p>
          <p className="text-xs">Made with a focus on accessibility and performance.</p>
        </div>
      </div>

      {/* Ensure footer content isn't hidden behind the fixed mobile BottomNav */}
      <div className="h-24 md:hidden" aria-hidden="true" />
    </footer>
  );
}
