interface AdCardProps {
  label?: string;
  title?: string;
  body?: string;
  variant?: "banner" | "panel";
}

export default function AdCard({
  label = "Sponsored",
  title = "Your Ad Here",
  body = "Promote your brand to football fans on Kuas24.",
  variant = "banner",
}: AdCardProps) {
  if (variant === "banner") {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-border">
        <div className="absolute inset-0 bg-card" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(0,194,255,0.55), transparent 55%), radial-gradient(circle at 62% 18%, rgba(240,248,255,0.75), transparent 60%), radial-gradient(circle at 85% 70%, rgba(5,62,255,0.30), transparent 55%), linear-gradient(135deg, rgba(0,194,255,0.20), rgba(5,62,255,0.18))",
          }}
        />

        <div className="relative grid min-h-[160px] grid-cols-1 gap-4 p-5 sm:min-h-[190px] sm:grid-cols-[minmax(0,1fr)_240px] sm:p-6">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[10px]">
                  AD
                </span>
                {label}
              </span>
              <span className="hidden text-xs font-medium text-white/80 sm:block">
                Advertisement
              </span>
            </div>

            <h3 className="max-w-[34ch] text-lg font-extrabold leading-tight text-white sm:text-2xl">
              {title}
            </h3>
            <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-white/85">
              {body}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#053eff] transition-colors hover:bg-white/90">
                Learn more
              </button>
              <span className="text-xs font-medium text-white/70">
                Powered by Kuas24
              </span>
            </div>
          </div>

          {/* Decorative product area (mock) */}
          <div className="relative hidden sm:block">
            <div className="absolute -top-6 right-6 h-24 w-24 rounded-full bg-white/35 blur-2xl" />
            <div className="absolute bottom-0 right-2 h-28 w-28 rounded-full bg-secondary/35 blur-2xl" />

            {/* "Cans" */}
            <div className="absolute bottom-[-6px] right-8 h-[150px] w-[74px] rotate-[-10deg] rounded-[18px] border border-white/35 bg-white/15 backdrop-blur-sm shadow-[0_18px_40px_rgba(0,0,0,0.22)]" />
            <div className="absolute bottom-[-10px] right-0 h-[158px] w-[78px] rotate-[8deg] rounded-[18px] border border-white/35 bg-white/10 backdrop-blur-sm shadow-[0_18px_40px_rgba(0,0,0,0.22)]" />

            {/* Label strips */}
            <div className="absolute bottom-16 right-10 h-8 w-[60px] rotate-[-10deg] rounded-xl bg-white/25" />
            <div className="absolute bottom-14 right-2 h-8 w-[64px] rotate-[8deg] rounded-xl bg-white/20" />

            {/* Citrus slice */}
            <div className="absolute bottom-8 right-[86px] h-14 w-14 rounded-full border border-white/40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(255,255,255,0.35)_35%,rgba(0,194,255,0.25)_70%)] shadow-[0_16px_30px_rgba(0,0,0,0.18)]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
          {label}
        </span>
        <span className="text-xs text-text-secondary">Advertisement</span>
      </div>
      <div className="grid gap-2">
        <h3 className="text-base font-bold text-text sm:text-lg">{title}</h3>
        <p className="text-sm text-text-secondary">{body}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-lg bg-bg px-3 py-1 text-xs font-medium text-text-secondary">
            Premier League
          </span>
          <span className="rounded-lg bg-bg px-3 py-1 text-xs font-medium text-text-secondary">
            Champions League
          </span>
          <span className="rounded-lg bg-bg px-3 py-1 text-xs font-medium text-text-secondary">
            Matchday
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-text-secondary">Powered by Kuas24</span>
          <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover">
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
}
