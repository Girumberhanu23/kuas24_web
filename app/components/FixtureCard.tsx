import Link from "next/link";
import { Fixture } from "../lib/types";

interface FixtureCardProps {
  fixture: Fixture;
}

export default function FixtureCard({ fixture }: FixtureCardProps) {
  const isLive = fixture.status === "live";
  const isFinished = fixture.status === "finished";
  const fixtureId = String(fixture.id ?? "").trim();

  const homeInitials = fixture.homeTeam
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3);

  const awayInitials = fixture.awayTeam
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3);

  return (
    <Link
      href={`/fixtures/${encodeURIComponent(fixtureId)}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary/20 hover:bg-card-hover"
    >
      {/* Status indicator */}
      <div className="flex w-16 shrink-0 flex-col items-center">
        {isLive ? (
          <>
            <span className="live-pulse mb-0.5 text-xs font-bold text-live">
              LIVE
            </span>
            <span className="text-[10px] font-medium text-live">
              {fixture.minute}
            </span>
          </>
        ) : isFinished ? (
          <span className="text-xs font-semibold text-text-secondary">
            FT
          </span>
        ) : (
          <span className="text-xs font-medium text-text-secondary">
            {fixture.time}
          </span>
        )}
      </div>

      {/* Teams & Score */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            {fixture.homeTeamLogo ? (
              <img
                src={fixture.homeTeamLogo}
                alt={`${fixture.homeTeam} logo`}
                className="h-6 w-6 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded bg-surface text-[9px] font-bold text-text-secondary">
                {homeInitials}
              </div>
            )}
            <span
              className={`min-w-0 truncate text-sm font-medium ${
                isFinished &&
                fixture.homeScore !== null &&
                fixture.awayScore !== null &&
                fixture.homeScore > fixture.awayScore
                  ? "text-text"
                  : isFinished
                  ? "text-text-secondary"
                  : "text-text"
              }`}
            >
              {fixture.homeTeam}
            </span>
          </div>
          <span
            className={`min-w-[28px] shrink-0 text-right text-sm font-bold ${
              isLive ? "text-text" : isFinished ? "text-text-secondary" : "text-text-secondary"
            }`}
          >
            {fixture.homeScore !== null ? fixture.homeScore : "-"}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            {fixture.awayTeamLogo ? (
              <img
                src={fixture.awayTeamLogo}
                alt={`${fixture.awayTeam} logo`}
                className="h-6 w-6 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded bg-surface text-[9px] font-bold text-text-secondary">
                {awayInitials}
              </div>
            )}
            <span
              className={`min-w-0 truncate text-sm font-medium ${
                isFinished &&
                fixture.homeScore !== null &&
                fixture.awayScore !== null &&
                fixture.awayScore > fixture.homeScore
                  ? "text-text"
                  : isFinished
                  ? "text-text-secondary"
                  : "text-text"
              }`}
            >
              {fixture.awayTeam}
            </span>
          </div>
          <span
            className={`min-w-[28px] shrink-0 text-right text-sm font-bold ${
              isLive ? "text-text" : isFinished ? "text-text-secondary" : "text-text-secondary"
            }`}
          >
            {fixture.awayScore !== null ? fixture.awayScore : "-"}
          </span>
        </div>
      </div>
    </Link>
  );
}
