"use client";

import { helmetMotif } from "@/lib/identity";

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
  const uid = `hm-${number ?? 0}-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      role="img"
      aria-hidden
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <path d="M12 48c0-18 10-34 24-34s24 16 24 34v6H12z" />
        </clipPath>
      </defs>
      <path
        d="M12 48c0-18 10-34 24-34s24 16 24 34v6c0 3-2 5-5 5H17c-3 0-5-2-5-5z"
        fill={accent}
      />
      <path
        d="M16 42h40v8c0 2-1.5 4-4 4H20c-2.5 0-4-2-4-4z"
        fill="#0b0f14"
        opacity="0.88"
      />
      <g clipPath={`url(#${uid}-clip)`}>
        {motif === 0 && (
          <path d="M18 22h36v6H18z" fill={second} opacity="0.9" />
        )}
        {motif === 1 && (
          <path
            d="M36 16 L48 40 L24 40 Z"
            fill={second}
            opacity="0.85"
          />
        )}
        {motif === 2 && (
          <>
            <rect x="12" y="16" width="24" height="34" fill={second} opacity="0.55" />
            <rect x="36" y="16" width="24" height="34" fill="#0b0f14" opacity="0.25" />
          </>
        )}
      </g>
      <path
        d="M18 28c4-6 10-10 18-10s14 4 18 10"
        fill="none"
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="2"
      />
    </svg>
  );
}
