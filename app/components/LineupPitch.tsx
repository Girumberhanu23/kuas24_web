"use client";

import React from "react";
import type { LineupTeam, LineupPlayer, TeamColors } from "../lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LineupPitchProps {
  home: LineupTeam;
  away: LineupTeam;
  homeTeamName?: string;
  awayTeamName?: string;
  referee?: string;
}

/* ------------------------------------------------------------------ */
/*  Grid → percent position helpers                                    */
/* ------------------------------------------------------------------ */

function parseGrid(value: string | null) {
  if (!value) return { row: 1, col: 1 };
  const [rowRaw, colRaw] = value.split(":");
  const row = Number(rowRaw);
  const col = Number(colRaw);
  return {
    row: Number.isFinite(row) && row > 0 ? row : 1,
    col: Number.isFinite(col) && col > 0 ? col : 1,
  };
}

/**
 * Convert the API-Sports grid values into (x%, y%) positions
 * for absolute placement inside the pitch container.
 *
 * Home team occupies the top half, away team the bottom (mirrored).
 *
 * `yStart` / `yEnd` define the vertical band in percent for that half.
 */
function buildPositions(
  players: LineupPlayer[],
  side: "home" | "away"
) {
  const parsed = players.map((p) => ({ player: p, ...parseGrid(p.grid) }));

  const maxRow = Math.max(...parsed.map((p) => p.row), 1);

  /* Group by row to figure out how many columns per row */
  const rowGroups: Record<number, typeof parsed> = {};
  for (const item of parsed) {
    (rowGroups[item.row] ??= []).push(item);
  }

  /* Sort each row by col ascending */
  for (const key of Object.keys(rowGroups)) {
    rowGroups[Number(key)].sort((a, b) => a.col - b.col);
  }

  /* Vertical band boundaries (% of total pitch height) */
  const topStart = 5;
  const topEnd = 45;
  const bottomStart = 55;
  const bottomEnd = 95;

  return parsed.map(({ player, row }) => {
    /* Find how many players in this row */
    const siblings = rowGroups[row];
    const colIndex = siblings.findIndex(
      (s) => s.player.name === player.name && s.player.number === player.number
    );
    const colCount = siblings.length;

    /* Horizontal: evenly spread across pitch width */
    const xPadding = 12; // % from each side
    const x =
      colCount === 1
        ? 50
        : xPadding + (colIndex / (colCount - 1)) * (100 - 2 * xPadding);

    /* Vertical: spread rows across assigned half */
    const rowProgress = maxRow === 1 ? 0.5 : (row - 1) / (maxRow - 1);
    const y =
      side === "home"
        ? topStart + rowProgress * (topEnd - topStart)
        : bottomEnd - rowProgress * (bottomEnd - bottomStart);

    return { ...player, x, y };
  });
}

/* ------------------------------------------------------------------ */
/*  Abbreviate player name to "Initial. Surname"                       */
/* ------------------------------------------------------------------ */

function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const surname = parts[parts.length - 1];
  return `${parts[0][0]}. ${surname}`;
}

function avatarUrl(name?: string, fallback = "Unknown") {
  const safeName = (name?.trim() || fallback).replace(/\s+/g, " ");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    safeName
  )}&background=1f2937&color=ffffff&size=96`;
}

/* ------------------------------------------------------------------ */
/*  Team color helpers                                                 */
/* ------------------------------------------------------------------ */

function hexToStyle(hex: string) {
  // Ensure hex has # prefix
  return hex.startsWith("#") ? hex : `#${hex}`;
}

function getPlayerStyle(colors?: TeamColors) {
  if (!colors) {
    return {
      bg: "#1a1a2e",
      text: "#ffffff",
      border: "rgba(255,255,255,0.3)",
    };
  }
  return {
    bg: hexToStyle(colors.primary),
    text: hexToStyle(colors.number),
    border: hexToStyle(colors.border),
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LineupPitch({
  home,
  away,
  homeTeamName,
  awayTeamName,
  referee,
}: LineupPitchProps) {
  const homeFormation = home.formation ?? "?";
  const awayFormation = away.formation ?? "?";
  const homeLabel = (home.team.name || homeTeamName || "Home").toUpperCase();
  const awayLabel = (away.team.name || awayTeamName || "Away").toUpperCase();

  const homePlayers = buildPositions(home.startXI, "home");
  const awayPlayers = buildPositions(away.startXI, "away");

  const homeColors = getPlayerStyle(home.team.colors?.player);
  const awayColors = getPlayerStyle(away.team.colors?.player);
  const homeCoach = home.coach?.name ?? "Not available";
  const awayCoach = away.coach?.name ?? "Not available";
  const refereeName = referee?.trim() || "Not available";
  const homeCoachPhoto = home.coach?.photo?.trim() || avatarUrl(homeCoach, "Home Coach");
  const awayCoachPhoto = away.coach?.photo?.trim() || avatarUrl(awayCoach, "Away Coach");
  const refereePhoto = avatarUrl(refereeName, "Referee");

  return (
    <div className="space-y-3">
      {/* Pitch background image */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        <div
          className="relative w-full"
          style={{
            /* Very compact aspect ratio */
            paddingBottom: "75%",
            backgroundImage: "url('/images/field.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Slight gradient overlays for readability */}
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/30 pointer-events-none" />

          {/* -------- TEAM / FORMATION LABELS -------- */}
          <div className="absolute top-2 left-3 z-20 flex items-center gap-1.5">
            {home.team.logo && (
              <img src={home.team.logo} alt="" className="h-4 w-4 object-contain" />
            )}
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {homeLabel}&ensp;{homeFormation}
            </span>
          </div>
          <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1.5">
            {away.team.logo && (
              <img src={away.team.logo} alt="" className="h-4 w-4 object-contain" />
            )}
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {awayLabel}&ensp;{awayFormation}
            </span>
          </div>

          {/* -------- PLAYERS -------- */}
          <div className="absolute inset-0 z-10">
            {/* Home players */}
            {homePlayers.map((p) => (
              <div
                key={`h-${p.number}-${p.name}`}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="h-6 w-6 rounded-full object-cover shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:h-7 sm:w-7"
                    style={{
                      borderWidth: 2,
                      borderColor: homeColors.border,
                    }}
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:h-7 sm:w-7 sm:text-[11px]"
                    style={{
                      backgroundColor: homeColors.bg,
                      color: homeColors.text,
                      borderWidth: 2,
                      borderColor: homeColors.border,
                    }}
                  >
                    {p.number}
                  </div>
                )}
                <span className="mt-0.5 max-w-16 truncate text-center text-[8px] font-semibold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[9px]">
                  {shortName(p.name)}
                </span>
              </div>
            ))}

            {/* Away players */}
            {awayPlayers.map((p) => (
              <div
                key={`a-${p.number}-${p.name}`}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.name}
                    className="h-6 w-6 rounded-full object-cover shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:h-7 sm:w-7"
                    style={{
                      borderWidth: 2,
                      borderColor: awayColors.border,
                    }}
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.4)] sm:h-7 sm:w-7 sm:text-[11px]"
                    style={{
                      backgroundColor: awayColors.bg,
                      color: awayColors.text,
                      borderWidth: 2,
                      borderColor: awayColors.border,
                    }}
                  >
                    {p.number}
                  </div>
                )}
                <span className="mt-0.5 max-w-16 truncate text-center text-[8px] font-semibold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] sm:text-[9px]">
                  {shortName(p.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card px-4 py-3">
        <div className="grid gap-3 text-xs text-text-secondary md:grid-cols-3">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]">Coach (Home)</p>
            <div className="flex items-center gap-2">
              <img src={homeCoachPhoto} alt={homeCoach} className="h-7 w-7 rounded-full object-cover" />
              <p className="text-sm font-semibold text-text">{homeCoach}</p>
            </div>
          </div>
          <div className="md:text-center">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]">Referee</p>
            <div className="flex items-center gap-2 md:justify-center">
              <img src={refereePhoto} alt={refereeName} className="h-7 w-7 rounded-full object-cover" />
              <p className="text-sm font-semibold text-text">{refereeName}</p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em]">Coach (Away)</p>
            <div className="flex items-center gap-2 md:justify-end">
              <img src={awayCoachPhoto} alt={awayCoach} className="h-7 w-7 rounded-full object-cover" />
              <p className="text-sm font-semibold text-text">{awayCoach}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
