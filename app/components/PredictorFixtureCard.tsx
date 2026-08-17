"use client";

import { useEffect, useState } from "react";
import { usePredictorStrings } from "../lib/predictor-strings";
import { useDateFormat } from "../lib/date-format";
import type { PredictorFixture, PredictorPick } from "../lib/predictor-types";

interface PredictorFixtureCardProps {
  fixture: PredictorFixture;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onPick: (fixtureId: string, pick: PredictorPick) => void;
  onNeedLogin?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3);
}

export default function PredictorFixtureCard({
  fixture,
  isAuthenticated,
  isSubmitting,
  onPick,
  onNeedLogin,
}: PredictorFixtureCardProps) {
  const strings = usePredictorStrings();
  const { formatDate, formatTime } = useDateFormat();
  // const router = useRouter();

  const kickoffDate = new Date(fixture.kickoff);
  const kickoffMs = kickoffDate.getTime();

  // Date.now() can't be called during render (breaks purity), so the lock
  // check runs in an effect and defaults to "open" until it resolves.
  const [isLocked, setIsLocked] = useState(false);
  useEffect(() => {
    const check = () => setIsLocked(Date.now() >= kickoffMs);
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [kickoffMs]);

  const dateLabel = formatDate(kickoffDate, "medium");
  const timeLabel = formatTime(kickoffDate);

  const handlePick = (pick: PredictorPick) => {
    if (isLocked || isSubmitting) return;
    if (!isAuthenticated) {
      if (onNeedLogin) onNeedLogin();
      return;
    }
    onPick(fixture.id, pick);
  };

  const options: { id: PredictorPick; label: string }[] = [
    { id: "HOME_WIN", label: fixture.homeTeam.name },
    { id: "DRAW", label: strings.fixtures.pickDraw },
    { id: "AWAY_WIN", label: fixture.awayTeam.name },
  ];

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="mb-3 flex items-center justify-between text-xs text-text-secondary">
        <span>
          {fixture.league.name} · {dateLabel} · {timeLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {[fixture.homeTeam, fixture.awayTeam].map((team) => (
          <div key={team.id} className="flex items-center gap-2.5">
            {team.logo ? (
              <img src={team.logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded bg-surface text-[9px] font-bold text-text-secondary">
                {initials(team.name)}
              </div>
            )}
            <span className="truncate text-sm font-medium text-text">{team.name}</span>
          </div>
        ))}
      </div>

      {isLocked ? (
        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-center text-xs font-medium text-text-secondary">
          {strings.fixtures.picksClosed}
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {options.map((option) => {
            const isSelected = fixture.userPick === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handlePick(option.id)}
                className={`rounded-lg px-2 py-2 text-xs font-bold transition-all disabled:opacity-60 ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-card-hover hover:text-text"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {!isAuthenticated && !isLocked && (
        <p className="mt-2 text-center text-[10px] text-text-secondary">{strings.fixtures.signInToPick}</p>
      )}
    </div>
  );
}
