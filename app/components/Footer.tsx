"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import { useDateFormat } from "../lib/date-format";
import { useNavStrings } from "../lib/nav-strings";

export default function Footer() {
  const strings = useNavStrings();
  const { formatYear } = useDateFormat();
  const year = formatYear();

  const quickLinks = [
    { href: "/", label: strings.footer.home },
    { href: "/football", label: strings.footer.football },
    { href: "/basketball", label: strings.footer.basketball },
    { href: "/live", label: strings.footer.liveScores },
  ] as const;

  const legalLinks = [
    { href: "/privacy-policy", label: strings.footer.privacyPolicy },
    { href: "/terms-and-conditions", label: strings.footer.termsAndConditions },
    { href: "/about-us", label: strings.footer.aboutUs },
  ] as const;

  const socialLinks = [
    {
      href: "https://facebook.com",
      label: "Facebook",
      Icon: FaFacebookF,
    },
    {
      href: "https://x.com",
      label: "X",
      Icon: FaXTwitter,
    },
    {
      href: "https://instagram.com",
      label: "Instagram",
      Icon: FaInstagram,
    },
  ] as const;

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[linear-gradient(to_bottom,#1A202C_0%,#161B24_35%,#161B24_100%)] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-8 right-0 select-none text-[140px] font-black uppercase tracking-[0.2em] text-white/[0.03] lg:text-[220px]">
        KUAS24
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <section className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-4">
              <Image
                src="/images/logo.png"
                alt="Kuas24 Logo"
                width={70}
                height={70}
                className="rounded-xl"
              />

              <div>
                <h2 className="text-2xl font-bold tracking-wide">KUAS24</h2>
                <p className="text-sm text-primary">{strings.footer.tagline}</p>
              </div>
            </Link>

            <p className="mt-6 max-w-md leading-7 text-slate-400">
              {strings.footer.description}
            </p>

            <div className="mt-8 flex gap-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/30"
                >
                  <Icon className="transition-transform duration-300 group-hover:rotate-12" />
                </a>
              ))}
            </div>
          </section>

          <nav>
            <h3 className="mb-5 text-lg font-bold tracking-wide text-white">{strings.footer.explore}</h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 rounded-md px-2 py-1.5 text-base font-semibold text-slate-200 transition-all duration-300 hover:-translate-x-0.5 hover:text-primary hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h3 className="mb-5 text-lg font-bold tracking-wide text-white">{strings.footer.legal}</h3>

            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-3 rounded-md px-2 py-1.5 text-base font-semibold text-slate-200 transition-all duration-300 hover:-translate-x-0.5 hover:text-primary hover:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 rounded-3xl border border-white/5 bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold">{strings.footer.ctaTitle}</h3>
              <p className="mt-2 text-slate-400">{strings.footer.ctaBody}</p>
            </div>

            <button className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40">
              {strings.footer.stayUpdated}
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-500 md:flex-row">
          <p>
            © {year}{" "}
            <span className="font-semibold text-white">KUAS24</span>.{" "}
            {strings.footer.allRightsReserved}
          </p>

          <p className="text-center text-xs text-slate-500">
            {strings.footer.builtForFans}
          </p>
        </div>
      </div>

      <div className="h-24 md:hidden" aria-hidden="true" />
    </footer>
  );
}
