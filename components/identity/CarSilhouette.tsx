"use client";

/**
 * Original Welch Software open-wheel side profile — not a team livery.
 * Shared for every driver; accent/second carry the house colour.
 */
export function CarSilhouette({
  accent,
  second,
  number,
  compoundLetter,
  width = 280,
}: {
  accent: string;
  second: string;
  number?: number;
  compoundLetter?: string;
  width?: number;
}) {
  const height = Math.round(width * (86 / 280));
  const uid = `car-${number ?? "x"}-${Math.round(width)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 86"
      role="img"
      aria-label={
        number != null ? `Open-wheel car number ${number}` : "Open-wheel car"
      }
      className="drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]"
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor={accent} stopOpacity="0.82" />
          <stop offset="42%" stopColor={accent} />
          <stop offset="100%" stopColor={second} />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={second} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a0c10" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#e8eef5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3a4658" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${uid}-rim`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="rgba(232,238,245,0.35)" />
          <stop offset="55%" stopColor="#12161e" />
          <stop offset="100%" stopColor="#05070a" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-25%" y="-50%" width="150%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="142" cy="78" rx="118" ry="6" fill="rgba(0,0,0,0.5)" />

      {/* diffuser / rear */}
      <path
        d="M214 48 L248 44 L256 58 L252 64 H218 Z"
        fill={`url(#${uid}-floor)`}
      />
      <path
        d="M220 58 H250 M224 61 H246 M228 64 H242"
        stroke={accent}
        strokeWidth="1.2"
        opacity="0.55"
      />

      {/* rear wing endplate + DRS */}
      <path
        d="M232 8 H268 L272 4 H228 Z"
        fill={second}
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="0.8"
      />
      <path d="M234 10 H264 L266 18 H236 Z" fill={accent} />
      <path
        d="M238 12 H262"
        stroke="rgba(232,238,245,0.35)"
        strokeWidth="1.5"
      />
      <path d="M236 18 H266 L268 24 H238 Z" fill={second} opacity="0.9" />
      <rect
        x="248"
        y="11"
        width="10"
        height="5"
        rx="1"
        fill="rgba(5,7,10,0.45)"
      />

      {/* rear suspension wishbone hint */}
      <path
        d="M198 40 L218 52"
        stroke="rgba(232,238,245,0.28)"
        strokeWidth="1.4"
      />
      <path
        d="M200 36 L220 48"
        stroke="rgba(232,238,245,0.18)"
        strokeWidth="1"
      />

      {/* wheels — rear */}
      <g filter={`url(#${uid}-glow)`}>
        <circle
          cx="208"
          cy="56"
          r="18"
          fill={`url(#${uid}-rim)`}
          stroke="rgba(232,238,245,0.35)"
          strokeWidth="2.2"
        />
        <circle cx="208" cy="56" r="10" fill="#0a0c10" />
        <circle
          cx="208"
          cy="56"
          r="5"
          fill="none"
          stroke={accent}
          strokeWidth="2"
        />
        <circle cx="208" cy="56" r="2.2" fill={second} />
      </g>

      {/* engine cover / airbox */}
      <path
        d="M118 22 L168 14 L198 18 L210 36 L168 42 L122 40 Z"
        fill={`url(#${uid}-body)`}
        filter={`url(#${uid}-glow)`}
      />
      <path
        d="M148 16 L178 12 L182 20 L152 24 Z"
        fill={second}
        opacity="0.85"
      />
      <path
        d="M130 20 L190 16"
        stroke="rgba(5,7,10,0.4)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M134 26 L186 22"
        stroke="rgba(232,238,245,0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* sidepod */}
      <path
        d="M96 36 L168 28 L198 34 L188 50 L108 52 Z"
        fill={accent}
        opacity="0.92"
      />
      <path
        d="M118 38 L178 32 L184 44 L124 48 Z"
        fill={second}
        opacity="0.55"
      />
      {/* cooling inlet */}
      <path
        d="M128 40 L152 36 L154 42 L130 46 Z"
        fill="rgba(5,7,10,0.55)"
      />

      {/* halo + cockpit */}
      <path
        d="M78 30 L118 22 L128 36 L88 42 Z"
        fill={`url(#${uid}-glass)`}
        stroke="rgba(232,238,245,0.25)"
        strokeWidth="1"
      />
      <path
        d="M92 28 L112 24"
        stroke="rgba(5,7,10,0.55)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M100 26 L100 38"
        stroke="rgba(232,238,245,0.45)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* mirror */}
      <path
        d="M108 24 L118 20 L120 24 L110 28 Z"
        fill={second}
      />

      {/* nose + front wing pillars */}
      <path
        d="M28 48 L72 32 L96 30 L88 46 L48 52 Z"
        fill={`url(#${uid}-body)`}
      />
      <path
        d="M28 48 L48 40 L52 48 Z"
        fill={second}
        opacity="0.75"
      />
      <path
        d="M40 44 L70 34"
        stroke="rgba(232,238,245,0.25)"
        strokeWidth="1.5"
      />

      {/* front wing */}
      <path
        d="M8 52 H64 L60 58 H14 Z"
        fill={second}
        stroke="rgba(5,7,10,0.3)"
        strokeWidth="0.8"
      />
      <path
        d="M12 56 H56"
        stroke={accent}
        strokeWidth="2"
        opacity="0.75"
      />
      <path
        d="M16 59 H50"
        stroke="rgba(232,238,245,0.35)"
        strokeWidth="1.2"
      />
      <path d="M22 50 L22 56" stroke={second} strokeWidth="2" />
      <path d="M48 48 L48 56" stroke={second} strokeWidth="2" />

      {/* front suspension */}
      <path
        d="M64 40 L78 54"
        stroke="rgba(232,238,245,0.3)"
        strokeWidth="1.5"
      />
      <path
        d="M68 36 L82 50"
        stroke="rgba(232,238,245,0.18)"
        strokeWidth="1"
      />

      {/* front wheel */}
      <g filter={`url(#${uid}-glow)`}>
        <circle
          cx="72"
          cy="56"
          r="17"
          fill={`url(#${uid}-rim)`}
          stroke="rgba(232,238,245,0.35)"
          strokeWidth="2.2"
        />
        <circle cx="72" cy="56" r="9.5" fill="#0a0c10" />
        <circle
          cx="72"
          cy="56"
          r="4.5"
          fill="none"
          stroke={accent}
          strokeWidth="2"
        />
        <circle cx="72" cy="56" r="2" fill={second} />
      </g>

      {/* barge board line */}
      <path
        d="M88 46 L118 44"
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {number != null && (
        <text
          x="158"
          y="40"
          textAnchor="middle"
          fill="#05070a"
          fontSize="15"
          fontFamily="var(--font-mono), monospace"
          fontWeight="900"
          style={{
            paintOrder: "stroke",
            stroke: "rgba(232,238,245,0.35)",
            strokeWidth: 2,
          }}
        >
          {number}
        </text>
      )}
      {compoundLetter && (
        <g>
          <rect
            x="188"
            y="44"
            width="16"
            height="12"
            rx="2"
            fill="rgba(5,7,10,0.75)"
            stroke={accent}
            strokeWidth="1"
          />
          <text
            x="196"
            y="53"
            textAnchor="middle"
            fill="rgba(232,238,245,0.95)"
            fontSize="9"
            fontFamily="var(--font-mono), monospace"
            fontWeight="700"
          >
            {compoundLetter}
          </text>
        </g>
      )}
    </svg>
  );
}
