"use client";

import type { TeamAccent } from "@/lib/identity";

/**
 * Abstract house marks — Welch Software originals, not team trademarks.
 * Geometry keyed by session accent house id.
 */
export function HouseMark({
  house,
  accent,
  second,
  size = 28,
  className,
}: {
  house: string;
  accent: string;
  second: string;
  size?: number;
  className?: string;
}) {
  const uid = `hmk-${house}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={second} />
        </linearGradient>
      </defs>
      {markFor(house, uid, accent, second)}
    </svg>
  );
}

function markFor(
  house: string,
  uid: string,
  accent: string,
  second: string,
) {
  switch (house) {
    case "ferrari":
      return (
        <>
          <path d="M4 28 L16 4 L28 28 Z" fill={`url(#${uid}-g)`} />
          <path d="M16 10 L22 24 H10 Z" fill="rgba(5,7,10,0.45)" />
        </>
      );
    case "mercedes":
      return (
        <>
          <circle cx="16" cy="16" r="12" fill="none" stroke={accent} strokeWidth="2.2" />
          <path
            d="M16 6 L18.5 14 H26 L20 19 L22.5 27 L16 22 L9.5 27 L12 19 L6 14 H13.5 Z"
            fill={second}
            opacity="0.95"
          />
        </>
      );
    case "mclaren":
      return (
        <>
          <path d="M4 24 L16 4 L28 24 Z" fill={accent} />
          <path d="M8 24 H24 L16 10 Z" fill={second} opacity="0.35" />
          <rect x="14" y="18" width="4" height="8" fill="rgba(5,7,10,0.55)" />
        </>
      );
    case "redbull":
      return (
        <>
          <path d="M6 26 L16 4 L26 26 Z" fill={accent} />
          <path d="M16 8 L22 24 H10 Z" fill={second} />
          <circle cx="16" cy="18" r="2.5" fill="rgba(5,7,10,0.7)" />
        </>
      );
    case "astonmartin":
      return (
        <>
          <rect x="5" y="5" width="22" height="22" rx="2" fill={accent} />
          <path d="M8 22 L16 8 L24 22 Z" fill={second} opacity="0.9" />
        </>
      );
    case "williams":
      return (
        <>
          <path d="M4 8 H28 V12 H18 V24 H14 V12 H4 Z" fill={`url(#${uid}-g)`} />
        </>
      );
    case "alpine":
      return (
        <>
          <path d="M4 16 L16 4 L28 16 L16 28 Z" fill={accent} />
          <path d="M10 16 L16 10 L22 16 L16 22 Z" fill={second} opacity="0.85" />
        </>
      );
    case "haas":
      return (
        <>
          <rect x="4" y="6" width="10" height="20" fill={accent} />
          <rect x="18" y="6" width="10" height="20" fill={second} />
        </>
      );
    case "racingbulls":
      return (
        <>
          <path d="M4 22 L10 8 H16 L10 22 Z" fill={accent} />
          <path d="M16 22 L22 8 H28 L22 22 Z" fill={second} />
        </>
      );
    case "audi":
      return (
        <>
          {[7, 13, 19, 25].map((cx) => (
            <circle
              key={cx}
              cx={cx}
              cy="16"
              r="5"
              fill="none"
              stroke={accent}
              strokeWidth="1.8"
            />
          ))}
        </>
      );
    case "cadillac":
      return (
        <>
          <path
            d="M16 4 L26 10 V22 L16 28 L6 22 V10 Z"
            fill={accent}
            opacity="0.9"
          />
          <path d="M16 10 L22 14 V20 L16 24 L10 20 V14 Z" fill={second} />
        </>
      );
    default:
      return (
        <>
          <rect x="4" y="4" width="24" height="24" rx="4" fill={accent} />
          <circle cx="16" cy="16" r="6" fill={second} opacity="0.85" />
        </>
      );
  }
}

/** Compact rail labels — keep short so vertical type fits the card. */
const HOUSE_SHORT: Record<string, string> = {
  ferrari: "FERRARI",
  mercedes: "MERC",
  mclaren: "MCL",
  redbull: "RBR",
  astonmartin: "AM",
  williams: "WILL",
  alpine: "ALP",
  haas: "HAAS",
  racingbulls: "RB",
  audi: "AUDI",
  cadillac: "CAD",
  field: "FIELD",
};

export function houseLabelShort(accent: TeamAccent): string {
  return HOUSE_SHORT[accent.house] ?? accent.house.toUpperCase();
}
