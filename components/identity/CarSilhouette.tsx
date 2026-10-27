"use client";

/** Original Welch Software open-wheel mark — not a team livery asset. */
export function CarSilhouette({
  accent,
  second,
  number,
  compoundLetter,
  width = 240,
}: {
  accent: string;
  second: string;
  number?: number;
  compoundLetter?: string;
  width?: number;
}) {
  const height = Math.round(width * (64 / 240));
  const uid = `car-${number ?? 0}-${width}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 64"
      role="img"
      aria-hidden
      className="drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor={accent} stopOpacity="0.75" />
          <stop offset="45%" stopColor={accent} />
          <stop offset="100%" stopColor={second} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dce8f5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6b7788" stopOpacity="0.25" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* shadow */}
      <ellipse cx="118" cy="54" rx="96" ry="5" fill="rgba(0,0,0,0.45)" />

      {/* rear wing */}
      <path
        d="M168 16 H214 L218 12 H164 Z"
        fill={second}
        opacity="0.95"
      />
      <path d="M170 16 H210 L212 22 H172 Z" fill={accent} />

      {/* wheels */}
      <g>
        <circle cx="54" cy="42" r="14" fill="#0a0c10" stroke="rgba(232,238,245,0.28)" strokeWidth="2" />
        <circle cx="54" cy="42" r="7" fill="rgba(232,238,245,0.12)" />
        <circle cx="54" cy="42" r="2.5" fill={accent} />
        <circle cx="176" cy="42" r="14" fill="#0a0c10" stroke="rgba(232,238,245,0.28)" strokeWidth="2" />
        <circle cx="176" cy="42" r="7" fill="rgba(232,238,245,0.12)" />
        <circle cx="176" cy="42" r="2.5" fill={accent} />
      </g>

      {/* floor / barge */}
      <path
        d="M34 40 L58 30 H128 L168 24 H196 L204 36 H182 L142 40 Z"
        fill={`url(#${uid}-body)`}
        filter={`url(#${uid}-glow)`}
      />

      {/* sidepod panel */}
      <path
        d="M118 30 L168 24 L176 36 L126 40 Z"
        fill={second}
        opacity="0.88"
      />

      {/* nose */}
      <path
        d="M34 40 L58 30 L72 28 L48 40 Z"
        fill={accent}
      />
      <path
        d="M28 40 L48 34 L52 40 Z"
        fill={second}
        opacity="0.7"
      />

      {/* halo / cockpit glass */}
      <path
        d="M72 28 L108 22 L118 30 L78 34 Z"
        fill={`url(#${uid}-glass)`}
      />

      {/* front wing */}
      <path
        d="M18 42 H52 L48 46 H22 Z"
        fill={second}
        opacity="0.85"
      />
      <path
        d="M20 46 H46"
        stroke={accent}
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* engine cover stripe */}
      <path
        d="M108 24 L158 20"
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {number != null && (
        <text
          x="146"
          y="36"
          textAnchor="middle"
          fill="#05070a"
          fontSize="12"
          fontFamily="var(--font-mono), monospace"
          fontWeight="800"
        >
          {number}
        </text>
      )}
      {compoundLetter && (
        <text
          x="176"
          y="46"
          textAnchor="middle"
          fill="rgba(232,238,245,0.9)"
          fontSize="9"
          fontFamily="var(--font-mono), monospace"
          fontWeight="700"
        >
          {compoundLetter}
        </text>
      )}
    </svg>
  );
}
