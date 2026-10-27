"use client";

import { useId } from "react";
import { helmetMotif } from "@/lib/identity";

/** Original geometric helmet — not a driver photograph or team asset. */
export function HelmetMark({
  number,
  accent,
  second,
  size = 72,
}: {
  number?: number;
  accent: string;
  second: string;
  size?: number;
}) {
  const motif = helmetMotif(number);
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-shell`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={second} stopOpacity="0.95" />
          <stop offset="45%" stopColor={accent} />
          <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8eef5" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#0b0f14" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#121820" stopOpacity="0.9" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <path d="M14 46c0-16 9-30 22-30s22 14 22 30v8H14z" />
        </clipPath>
      </defs>

      {/* chin / collar ring */}
      <ellipse
        cx="36"
        cy="58"
        rx="20"
        ry="7"
        fill="rgba(5,7,10,0.55)"
      />

      {/* shell */}
      <path
        d="M14 46c0-16 9-30 22-30s22 14 22 30v8c0 2.8-2 5-5 5H19c-3 0-5-2.2-5-5z"
        fill={`url(#${uid}-shell)`}
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="1"
      />

      {/* motif under visor */}
      <g clipPath={`url(#${uid}-clip)`}>
        {motif === 0 && (
          <>
            <path d="M18 20h36v7H18z" fill={second} opacity="0.92" />
            <path d="M18 30h36v3H18z" fill="rgba(5,7,10,0.35)" />
          </>
        )}
        {motif === 1 && (
          <path
            d="M36 14 L52 42 L20 42 Z"
            fill={second}
            opacity="0.88"
          />
        )}
        {motif === 2 && (
          <>
            <rect
              x="14"
              y="16"
              width="22"
              height="36"
              fill={second}
              opacity="0.65"
            />
            <rect
              x="36"
              y="16"
              width="22"
              height="36"
              fill="rgba(5,7,10,0.3)"
            />
            <path
              d="M34 16 V52"
              stroke="rgba(232,238,245,0.35)"
              strokeWidth="2"
            />
          </>
        )}
      </g>

      {/* visor band */}
      <path
        d="M17 40h38v9c0 2.2-1.6 4-4 4H21c-2.4 0-4-1.8-4-4z"
        fill={`url(#${uid}-visor)`}
      />
      <path
        d="M20 42.5 H52"
        stroke="rgba(232,238,245,0.28)"
        strokeWidth="1.2"
      />

      {/* crown highlight */}
      <path
        d="M22 26c5-8 11-12 14-12s9 4 14 12"
        fill="none"
        stroke="rgba(232,238,245,0.28)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* cheek vents */}
      <path
        d="M18 50h6M48 50h6"
        stroke="rgba(5,7,10,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {number != null && (
        <text
          x="36"
          y="34"
          textAnchor="middle"
          fill="rgba(5,7,10,0.55)"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          fontWeight="900"
        >
          {number}
        </text>
      )}
    </svg>
  );
}
