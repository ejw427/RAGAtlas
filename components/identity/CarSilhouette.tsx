"use client";

import { useId } from "react";
import {
  TRACK_PACKAGES,
  type TrackPackage,
  type TrackPackageId,
} from "@/lib/track-package";

/**
 * Original Welch Software open-wheel side profile — not a team livery.
 * Continuous body curves + layered aero; track packages scale wing / cooling / rake.
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
  const height = Math.round(width * (132 / 400));
  const uid = useId().replace(/:/g, "");

  // Track package levers (subtle — proportions stay car-like)
  const rearY = 18 - (pkg.rearWing - 1) * 14;
  const rearH = 22 + (pkg.rearWing - 1) * 10;
  const cool = pkg.cooling;
  const duct = pkg.brakeDuct;
  const fwSpan = 48 + (pkg.frontWing - 1) * 18;
  const rake = (pkg.rake - 1) * 3;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 132"
      role="img"
      aria-label={
        number != null
          ? `Open-wheel car number ${number}, ${pkg.chip}`
          : `Open-wheel car, ${pkg.chip}`
      }
      className="drop-shadow-[0_18px_28px_rgba(0,0,0,0.75)]"
    >
      <defs>
        <linearGradient id={`${uid}-hull`} x1="0" y1="0.15" x2="1" y2="0.55">
          <stop offset="0%" stopColor={second} />
          <stop offset="28%" stopColor={accent} />
          <stop offset="72%" stopColor={accent} />
          <stop offset="100%" stopColor={second} stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${uid}-belly`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={second} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#05070a" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#eef4fb" stopOpacity="0.92" />
          <stop offset="45%" stopColor="#7a8ea8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0e141c" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${uid}-carbon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a3038" />
          <stop offset="50%" stopColor="#0a0c10" />
          <stop offset="100%" stopColor="#1c222a" />
        </linearGradient>
        <linearGradient id={`${uid}-tyre`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c444e" />
          <stop offset="22%" stopColor="#12151a" />
          <stop offset="55%" stopColor="#05070a" />
          <stop offset="82%" stopColor="#1a1e24" />
          <stop offset="100%" stopColor="#2e343c" />
        </linearGradient>
        <radialGradient id={`${uid}-rim`} cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="rgba(240,244,250,0.55)" />
          <stop offset="35%" stopColor="#1a1e26" />
          <stop offset="100%" stopColor="#05070a" />
        </radialGradient>
        <linearGradient id={`${uid}-wing`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={second} />
          <stop offset="40%" stopColor={accent} />
          <stop offset="100%" stopColor={second} stopOpacity="0.8" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-8%" y="-20%" width="116%" height="140%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
      </defs>

      {/* Soft ground contact */}
      <ellipse
        cx="198"
        cy="118"
        rx="168"
        ry="7.5"
        fill="rgba(0,0,0,0.55)"
        filter={`url(#${uid}-soft)`}
      />

      {/* —— Rear wing (behind body so pylons read clean) —— */}
      <g transform={`translate(0 ${rearY})`}>
        {/* Endplates */}
        <path
          d={`M318 ${rearH + 8} L312 56 L328 58 L334 ${rearH + 10} Z`}
          fill={`url(#${uid}-carbon)`}
        />
        <path
          d={`M352 ${rearH + 6} L348 54 L364 56 L368 ${rearH + 8} Z`}
          fill={`url(#${uid}-carbon)`}
        />
        {/* Main plane */}
        <path
          d={`M314 ${rearH} H366 L370 ${rearH + 7} H310 Z`}
          fill={`url(#${uid}-wing)`}
        />
        {/* Upper flap */}
        <path
          d={`M318 ${rearH - 8} H362 L366 ${rearH - 2} H314 Z`}
          fill={accent}
          opacity="0.95"
        />
        <path
          d={`M322 ${rearH - 6} H356`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
        />
        {/* DRS gap */}
        <rect
          x="332"
          y={rearH - 5}
          width="14"
          height="3.5"
          rx="0.8"
          fill="rgba(5,7,10,0.65)"
        />
        {/* Beam wing */}
        <path
          d={`M320 ${rearH + 14} H358 L360 ${rearH + 18} H318 Z`}
          fill={second}
          opacity="0.9"
        />
        {/* Pylons */}
        <path
          d={`M330 ${rearH + 18} L326 62`}
          stroke={`url(#${uid}-carbon)`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d={`M348 ${rearH + 18} L344 62`}
          stroke={`url(#${uid}-carbon)`}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>

      {/* —— Diffuser / crash structure —— */}
      <path
        d="M268 72 C278 68, 300 64, 318 66 L322 86 C304 90, 286 92, 272 88 Z"
        fill={`url(#${uid}-belly)`}
      />
      <path
        d="M276 80 H312 M280 84 H306 M284 88 H298"
        stroke={accent}
        strokeWidth="1.1"
        opacity={0.35 + cool * 0.35}
        strokeLinecap="round"
      />

      {/* —— Continuous hull (nose → sidepod → engine cover) —— */}
      <path
        d={`
          M 28 ${78 + rake}
          C 52 ${62 + rake * 0.5}, 78 48, 108 44
          C 128 40, 148 36, 168 34
          C 198 30, 228 28, 252 32
          C 268 34, 282 40, 292 50
          C 300 58, 304 68, 300 76
          C 292 86, 268 90, 240 92
          C 200 94, 160 94, 128 92
          C 104 90, 84 88, 68 ${86 + rake * 0.3}
          C 52 ${84 + rake * 0.5}, 38 ${82 + rake}, 28 ${78 + rake}
          Z
        `}
        fill={`url(#${uid}-hull)`}
      />
      {/* Top-plane highlight following the body */}
      <path
        d={`
          M 40 ${74 + rake}
          C 70 54, 110 42, 160 36
          C 210 30, 250 32, 280 42
          C 270 38, 230 34, 180 38
          C 140 42, 100 50, 70 62
          C 55 68, 45 72, 40 ${74 + rake}
          Z
        `}
        fill={`url(#${uid}-top)`}
        opacity="0.85"
      />
      {/* Belly shadow */}
      <path
        d={`
          M 70 ${86 + rake * 0.3}
          C 120 90, 190 92, 260 86
          C 250 90, 180 94, 120 92
          C 95 90, 80 88, 70 ${86 + rake * 0.3}
          Z
        `}
        fill="rgba(0,0,0,0.28)"
      />

      {/* Sidepod sculpt + cooling inlet */}
      <path
        d="M128 58 C160 50, 200 48, 236 54 C228 66, 190 72, 150 72 C136 70, 130 64, 128 58 Z"
        fill={second}
        opacity={0.28 + cool * 0.2}
      />
      <path
        d={`M148 56 C168 ${52 - cool}, ${188 + cool * 10} ${54 + cool}, 204 62 C188 66, 164 66, 150 62 Z`}
        fill="rgba(5,7,10,0.72)"
      />
      <path
        d={`M154 58 L${178 + cool * 8} ${55 - cool * 0.5}`}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.9"
      />
      {/* Louvres */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${168 + i * 7} ${64 + i * 0.3} L${186 + i * 5} ${60 + i * 0.2}`}
          stroke="rgba(5,7,10,0.55)"
          strokeWidth="1.05"
          opacity={0.4 + cool * 0.4}
        />
      ))}

      {/* Centerline crease */}
      <path
        d="M96 52 C140 42, 190 36, 250 40"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M100 56 C144 46, 194 40, 248 44"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Airbox / engine cover peak */}
      <path
        d="M188 34 C210 22, 236 20, 258 28 L252 42 C234 34, 210 34, 192 40 Z"
        fill={second}
        opacity="0.88"
      />
      <path
        d="M210 28 C226 22, 242 22, 254 28"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.1"
      />

      {/* —— Halo + canopy —— */}
      <path
        d="M118 48 C138 36, 158 34, 174 42 L168 58 C152 54, 134 56, 122 60 Z"
        fill={`url(#${uid}-glass)`}
      />
      <path
        d="M124 50 C142 40, 160 40, 170 46"
        fill="none"
        stroke={`url(#${uid}-carbon)`}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M146 42 L146 58"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M132 48 L158 42"
        stroke="rgba(5,7,10,0.55)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Mirror */}
      <path
        d="M152 36 L166 30 L170 38 L154 42 Z"
        fill={second}
      />
      <path
        d="M156 34 L164 31"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.8"
      />

      {/* Nose tip highlight */}
      <path
        d={`M28 ${78 + rake} C40 ${68 + rake}, 58 58, 78 52 L72 64 C56 68, 42 ${74 + rake}, 28 ${78 + rake} Z`}
        fill={second}
        opacity="0.75"
      />

      {/* —— Front wing —— */}
      <g>
        <path
          d={`M4 ${82 + rake} H${4 + fwSpan} L${2 + fwSpan} ${92 + rake} H6 Z`}
          fill={`url(#${uid}-carbon)`}
        />
        <path
          d={`M8 ${86 + rake} H${fwSpan - 2}`}
          stroke={accent}
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d={`M10 ${89.5 + rake} H${fwSpan - 6}`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path
          d={`M12 ${92 + rake} H${fwSpan - 10}`}
          stroke="rgba(5,7,10,0.45)"
          strokeWidth="0.9"
        />
        {/* Endplate */}
        <path
          d={`M${fwSpan - 2} ${80 + rake} L${fwSpan + 2} ${94 + rake} L${fwSpan - 6} ${94 + rake} Z`}
          fill={second}
        />
        {/* Nose pillars */}
        <path
          d={`M22 ${70 + rake} L22 ${86 + rake}`}
          stroke={second}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d={`M42 ${62 + rake * 0.4} L42 ${86 + rake}`}
          stroke={second}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>

      {/* Brake duct */}
      <path
        d={`M78 ${58 + rake * 0.2} C86 ${54}, ${92 + duct * 2} ${58 + duct}, 90 ${66 + duct * 0.6} C84 ${68}, 78 64, 78 ${58 + rake * 0.2} Z`}
        fill="rgba(5,7,10,0.65)"
        opacity={0.5 + duct * 0.45}
      />

      {/* Suspension wishbones */}
      <path
        d="M88 58 L108 78"
        stroke="rgba(230,236,244,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M92 54 L112 74"
        stroke="rgba(230,236,244,0.18)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M248 56 L272 78"
        stroke="rgba(230,236,244,0.38)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M252 52 L276 74"
        stroke="rgba(230,236,244,0.16)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Wheels — drawn last so they sit over the floor */}
      <Wheel defsId={uid} cx={98} cy={86} r={22} accent={accent} second={second} />
      <Wheel defsId={uid} cx={278} cy={86} r={24} accent={accent} second={second} />

      {/* Number on sidepod */}
      {number != null && (
        <text
          x="196"
          y="68"
          textAnchor="middle"
          fill="#05070a"
          fontSize="22"
          fontFamily="var(--font-mono), monospace"
          fontWeight="900"
          style={{
            paintOrder: "stroke",
            stroke: "rgba(255,255,255,0.45)",
            strokeWidth: 3,
          }}
        >
          {number}
        </text>
      )}

      {/* Compound badge on rear tyre wall */}
      {compoundLetter && (
        <g>
          <rect
            x="256"
            y="68"
            width="18"
            height="13"
            rx="2"
            fill="rgba(5,7,10,0.88)"
            stroke={accent}
            strokeWidth="1.15"
          />
          <text
            x="265"
            y="78"
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
            x="10"
            y="108"
            width={Math.max(86, pkg.chip.length * 6.5 + 20)}
            height="15"
            rx="2"
            fill="rgba(5,7,10,0.82)"
            stroke="rgba(198,255,74,0.5)"
            strokeWidth="0.9"
          />
          <text
            x="18"
            y="118.5"
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
  const hub = r * 0.24;
  const rim = r * 0.56;
  return (
    <g>
      {/* Tyre */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${defsId}-tyre)`}
        stroke="rgba(232,238,245,0.28)"
        strokeWidth="1.8"
      />
      {/* Sidewall groove */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.84}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="3.2"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.72}
        fill="none"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="1.2"
      />
      {/* Rim */}
      <circle
        cx={cx}
        cy={cy}
        r={rim}
        fill={`url(#${defsId}-rim)`}
        stroke="rgba(232,238,245,0.3)"
        strokeWidth="1"
      />
      {/* Spokes */}
      {[0, 30, 60, 90, 120, 150].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx + Math.cos(a) * hub * 1.1}
            y1={cy + Math.sin(a) * hub * 1.1}
            x2={cx + Math.cos(a) * rim * 0.9}
            y2={cy + Math.sin(a) * rim * 0.9}
            stroke={accent}
            strokeWidth="1.25"
            opacity="0.78"
          />
        );
      })}
      <circle
        cx={cx}
        cy={cy}
        r={hub}
        fill="none"
        stroke={accent}
        strokeWidth="2"
      />
      <circle cx={cx} cy={cy} r={hub * 0.48} fill={second} />
      <circle cx={cx} cy={cy} r={hub * 0.2} fill="rgba(5,7,10,0.9)" />
    </g>
  );
}
