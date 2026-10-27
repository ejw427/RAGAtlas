"use client";

import { useId } from "react";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";

/**
 * Original Welch Software open-wheel side profile — not a team livery.
 * Track packages change wing, cooling, and rake so COTA ≠ Bahrain ≠ generic.
 */
export function CarSilhouette({
  accent,
  second,
  number,
  compoundLetter,
  width = 280,
  track = "cota",
  showPackageChip = false,
}: {
  accent: string;
  second: string;
  number?: number;
  compoundLetter?: string;
  width?: number;
  track?: TrackPackageId | TrackPackage;
  showPackageChip?: boolean;
}) {
  const pkg = typeof track === "string" ? TRACK_PACKAGES[track] : track;
  const height = Math.round(width * (118 / 340));
  const uid = useId().replace(/:/g, "");

  const wingLift = (pkg.rearWing - 1) * 16;
  const noseDrop = (pkg.rake - 1) * 5;
  const cool = pkg.cooling;
  const duct = pkg.brakeDuct;
  const fw = pkg.frontWing;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 118"
      role="img"
      aria-label={
        number != null
          ? `Open-wheel car number ${number}, ${pkg.chip}`
          : `Open-wheel car, ${pkg.chip}`
      }
      className="drop-shadow-[0_14px_32px_rgba(0,0,0,0.65)]"
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="22%" stopColor={accent} />
          <stop offset="62%" stopColor={accent} />
          <stop offset="100%" stopColor={second} stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={second} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#05070a" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0.1" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f2f6fb" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#6a7a90" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#121820" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={`${uid}-rim`} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="rgba(232,238,245,0.55)" />
          <stop offset="40%" stopColor="#1a1e26" />
          <stop offset="100%" stopColor="#05070a" />
        </radialGradient>
        <linearGradient id={`${uid}-tyre`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a424c" />
          <stop offset="35%" stopColor="#12151a" />
          <stop offset="70%" stopColor="#0a0c10" />
          <stop offset="100%" stopColor="#222830" />
        </linearGradient>
        <linearGradient id={`${uid}-carbon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1e24" />
          <stop offset="50%" stopColor="#0c0e12" />
          <stop offset="100%" stopColor="#252a32" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-35%" y="-70%" width="170%" height="240%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="168" cy="104" rx="148" ry="8" fill="rgba(0,0,0,0.58)" />

      {/* Diffuser / rear crash structure */}
      <path
        d={`M242 ${58 - wingLift * 0.12} L285 ${50 - wingLift * 0.18} L298 74 L290 82 H248 Z`}
        fill={`url(#${uid}-floor)`}
      />
      <path
        d="M250 76 H286 M254 80 H282 M258 84 H276"
        stroke={accent}
        strokeWidth="1.2"
        opacity={0.45 + cool * 0.35}
      />
      <path
        d={`M288 ${62 - wingLift * 0.1} L304 ${58 - wingLift * 0.08} L308 78 L296 82 Z`}
        fill={`url(#${uid}-carbon)`}
      />

      {/* Rear wing assembly */}
      <path
        d={`M262 ${2 - wingLift} H318 L326 ${-2 - wingLift} H256 Z`}
        fill={second}
        stroke="rgba(5,7,10,0.45)"
        strokeWidth="0.85"
      />
      <path
        d={`M264 ${5 - wingLift} H312 L318 ${14 - wingLift * 0.75} H270 Z`}
        fill={accent}
        filter={`url(#${uid}-glow)`}
      />
      <path
        d={`M268 ${7 - wingLift} H306`}
        stroke="rgba(242,246,251,0.45)"
        strokeWidth="1.7"
      />
      <path
        d={`M266 ${15 - wingLift * 0.7} H314 L320 ${24 - wingLift * 0.4} H272 Z`}
        fill={second}
        opacity="0.94"
      />
      <path
        d={`M270 ${17 - wingLift * 0.65} H308`}
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="1.1"
      />
      {/* DRS flap gap */}
      <rect
        x="282"
        y={6 - wingLift}
        width="14"
        height="4.5"
        rx="1"
        fill="rgba(5,7,10,0.55)"
      />
      {/* Endplates */}
      <path
        d={`M270 ${24 - wingLift * 0.35} L260 52`}
        stroke={second}
        strokeWidth="2.4"
        opacity="0.9"
      />
      <path
        d={`M306 ${24 - wingLift * 0.35} L298 54`}
        stroke={second}
        strokeWidth="2.4"
        opacity="0.9"
      />
      {/* Rear wing pylons */}
      <path
        d={`M278 ${24 - wingLift * 0.35} L272 56`}
        stroke={`url(#${uid}-carbon)`}
        strokeWidth="3.2"
      />
      <path
        d={`M294 ${24 - wingLift * 0.35} L288 56`}
        stroke={`url(#${uid}-carbon)`}
        strokeWidth="3.2"
      />

      {/* Wishbone hint rear */}
      <path
        d="M228 50 L254 68"
        stroke="rgba(232,238,245,0.35)"
        strokeWidth="1.6"
      />
      <path
        d="M232 46 L258 64"
        stroke="rgba(232,238,245,0.18)"
        strokeWidth="1.15"
      />

      <Wheel
        defsId={uid}
        cx={242}
        cy={74}
        r={21.5}
        accent={accent}
        second={second}
      />

      {/* Engine cover / airbox */}
      <path
        d={`M136 ${30 + noseDrop * 0.15} L188 ${16 - wingLift * 0.12} L232 ${22 - wingLift * 0.08} L248 48 L196 56 L140 52 Z`}
        fill={`url(#${uid}-body)`}
        filter={`url(#${uid}-glow)`}
      />
      <path
        d={`M136 ${30 + noseDrop * 0.15} L188 ${16 - wingLift * 0.12} L232 ${22 - wingLift * 0.08} L248 48 L196 56 L140 52 Z`}
        fill={`url(#${uid}-shine)`}
      />
      <path
        d={`M168 ${18 - wingLift * 0.08} L204 ${12 - wingLift * 0.18} L212 26 L174 30 Z`}
        fill={second}
        opacity="0.9"
      />
      {/* Centerline crease */}
      <path
        d="M148 28 L220 20"
        stroke="rgba(5,7,10,0.4)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M152 36 L216 28"
        stroke="rgba(242,246,251,0.28)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Sidepod */}
      <path
        d="M112 46 L194 34 L236 44 L222 66 L124 70 Z"
        fill={accent}
        opacity="0.96"
      />
      <path
        d="M112 46 L194 34 L236 44 L222 66 L124 70 Z"
        fill={`url(#${uid}-shine)`}
        opacity="0.55"
      />
      <path
        d="M134 48 L204 38 L214 56 L142 62 Z"
        fill={second}
        opacity={0.38 + cool * 0.22}
      />
      {/* Cooling inlet — opens with track heat package */}
      <path
        d={`M146 50 L${146 + 32 + cool * 12} ${44 - cool * 1.2} L${148 + 32 + cool * 12} ${52 + cool * 2.2} L148 56 Z`}
        fill="rgba(5,7,10,0.68)"
      />
      <path
        d={`M150 51.5 L${150 + 26 + cool * 9} ${47 - cool * 0.6}`}
        stroke="rgba(242,246,251,0.22)"
        strokeWidth="0.9"
      />
      {/* Louvres */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${168 + i * 8} ${54 + i * 0.4} L${186 + i * 6} ${50 + i * 0.3}`}
          stroke="rgba(5,7,10,0.45)"
          strokeWidth="1.1"
          opacity={0.5 + cool * 0.35}
        />
      ))}

      {/* Floor edge */}
      <path
        d={`M102 ${58 + noseDrop * 0.25} L136 56 L138 64 L104 66 Z`}
        fill={second}
        opacity="0.72"
      />

      {/* Halo + canopy */}
      <path
        d="M90 40 L136 28 L150 48 L102 56 Z"
        fill={`url(#${uid}-glass)`}
        stroke="rgba(242,246,251,0.32)"
        strokeWidth="1.15"
      />
      <path
        d="M104 38 L130 30"
        stroke="rgba(5,7,10,0.65)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M116 34 L116 52"
        stroke="rgba(242,246,251,0.55)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Halo hoop */}
      <path
        d="M108 36 Q124 22 140 30"
        fill="none"
        stroke={`url(#${uid}-carbon)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Mirror */}
      <path d="M124 26 L138 20 L142 28 L126 32 Z" fill={second} />
      <path
        d="M128 24 L136 21"
        stroke="rgba(242,246,251,0.35)"
        strokeWidth="0.8"
      />

      {/* Nose cone */}
      <path
        d={`M18 ${64 + noseDrop} L82 ${38 + noseDrop * 0.35} L116 36 L104 ${58 + noseDrop * 0.15} L48 ${68 + noseDrop * 0.25} Z`}
        fill={`url(#${uid}-body)`}
      />
      <path
        d={`M18 ${64 + noseDrop} L82 ${38 + noseDrop * 0.35} L116 36 L104 ${58 + noseDrop * 0.15} L48 ${68 + noseDrop * 0.25} Z`}
        fill={`url(#${uid}-shine)`}
        opacity="0.4"
      />
      <path
        d={`M18 ${64 + noseDrop} L54 ${52 + noseDrop * 0.45} L58 ${64 + noseDrop * 0.25} Z`}
        fill={second}
        opacity="0.82"
      />
      <path
        d={`M46 ${56 + noseDrop * 0.55} L88 ${42 + noseDrop * 0.25}`}
        stroke="rgba(242,246,251,0.32)"
        strokeWidth="1.6"
      />

      {/* Front wing */}
      <path
        d={`M2 ${68 + noseDrop} H${62 * fw} L${58 * fw} ${78 + noseDrop} H${8 * fw} Z`}
        fill={second}
        stroke="rgba(5,7,10,0.4)"
        strokeWidth="0.85"
      />
      <path
        d={`M8 ${72 + noseDrop} H${54 * fw}`}
        stroke={accent}
        strokeWidth="2.2"
        opacity="0.85"
      />
      <path
        d={`M12 ${76 + noseDrop} H${50 * fw}`}
        stroke="rgba(242,246,251,0.4)"
        strokeWidth="1.2"
      />
      <path
        d={`M16 ${78.5 + noseDrop} H${46 * fw}`}
        stroke="rgba(5,7,10,0.35)"
        strokeWidth="0.9"
      />
      {/* Wing pillars */}
      <path
        d={`M20 ${62 + noseDrop} L20 ${72 + noseDrop}`}
        stroke={second}
        strokeWidth="2.4"
      />
      <path
        d={`M50 ${56 + noseDrop * 0.45} L50 ${72 + noseDrop}`}
        stroke={second}
        strokeWidth="2.4"
      />
      {/* Brake duct — opens with track package */}
      <path
        d={`M68 ${54 + noseDrop * 0.35} L78 ${50 + noseDrop * 0.25} L82 ${58 + duct * 1.1} L72 ${60 + duct * 0.55} Z`}
        fill="rgba(5,7,10,0.58)"
        opacity={0.5 + duct * 0.45}
      />

      {/* Front wishbones */}
      <path
        d="M76 50 L94 70"
        stroke="rgba(232,238,245,0.36)"
        strokeWidth="1.6"
      />
      <path
        d="M80 46 L98 66"
        stroke="rgba(232,238,245,0.18)"
        strokeWidth="1.15"
      />

      <Wheel
        defsId={uid}
        cx={86}
        cy={74}
        r={19.5}
        accent={accent}
        second={second}
      />

      {number != null && (
        <text
          x="180"
          y="52"
          textAnchor="middle"
          fill="#05070a"
          fontSize="18"
          fontFamily="var(--font-mono), monospace"
          fontWeight="900"
          style={{
            paintOrder: "stroke",
            stroke: "rgba(242,246,251,0.45)",
            strokeWidth: 2.6,
          }}
        >
          {number}
        </text>
      )}

      {compoundLetter && (
        <g>
          <rect
            x="218"
            y="56"
            width="18"
            height="13"
            rx="2"
            fill="rgba(5,7,10,0.82)"
            stroke={accent}
            strokeWidth="1.15"
          />
          <text
            x="227"
            y="66"
            textAnchor="middle"
            fill="rgba(242,246,251,0.95)"
            fontSize="9.5"
            fontFamily="var(--font-mono), monospace"
            fontWeight="700"
          >
            {compoundLetter}
          </text>
        </g>
      )}

      {showPackageChip && (
        <g>
          <rect
            x="8"
            y="96"
            width={Math.max(76, pkg.chip.length * 6.4 + 18)}
            height="14"
            rx="2"
            fill="rgba(5,7,10,0.78)"
            stroke="rgba(198,255,74,0.5)"
            strokeWidth="0.9"
          />
          <text
            x="16"
            y="106"
            fill="#C6FF4A"
            fontSize="8"
            fontFamily="var(--font-mono), monospace"
            fontWeight="700"
            letterSpacing="0.08em"
          >
            {pkg.chip.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
}

function Wheel({
  defsId,
  cx,
  cy,
  r,
  accent,
  second,
}: {
  defsId: string;
  cx: number;
  cy: number;
  r: number;
  accent: string;
  second: string;
}) {
  const hub = r * 0.26;
  const rim = r * 0.58;
  return (
    <g filter={`url(#${defsId}-glow)`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${defsId}-tyre)`}
        stroke="rgba(232,238,245,0.32)"
        strokeWidth="2.1"
      />
      {/* Sidewall ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.82}
        fill="none"
        stroke="rgba(232,238,245,0.12)"
        strokeWidth="3.5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={rim}
        fill={`url(#${defsId}-rim)`}
        stroke="rgba(232,238,245,0.28)"
        strokeWidth="1.1"
      />
      {[0, 45, 90, 135].map((deg) => {
        const a = ((deg - 15) * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx + Math.cos(a) * hub}
            y1={cy + Math.sin(a) * hub}
            x2={cx + Math.cos(a) * rim * 0.9}
            y2={cy + Math.sin(a) * rim * 0.9}
            stroke={accent}
            strokeWidth="1.35"
            opacity="0.75"
          />
        );
      })}
      <circle
        cx={cx}
        cy={cy}
        r={hub}
        fill="none"
        stroke={accent}
        strokeWidth="2.1"
      />
      <circle cx={cx} cy={cy} r={hub * 0.42} fill={second} />
      <circle
        cx={cx}
        cy={cy}
        r={hub * 0.18}
        fill="rgba(5,7,10,0.85)"
      />
    </g>
  );
}
