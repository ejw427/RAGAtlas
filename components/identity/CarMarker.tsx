/**
 * Top-down open-wheel mark for the circuit stage.
 * Clickable when onSelect is set — opens the racer card.
 */
export function CarMarker({
  cx,
  cy,
  angle,
  fill,
  second = "rgba(232,238,245,0.65)",
  number,
  code,
  offset = 0,
  scale = 1,
  glow,
  onSelect,
  pulseKey,
}: {
  cx: number;
  cy: number;
  angle: number;
  fill: string;
  second?: string;
  number?: number;
  code?: string;
  offset?: number;
  scale?: number;
  glow?: boolean;
  onSelect?: () => void;
  /** Change this when the racer identity changes so the mark flashes. */
  pulseKey?: string;
}) {
  const rad = ((angle + 90) * Math.PI) / 180;
  const ox = Math.cos(rad) * offset * scale;
  const oy = Math.sin(rad) * offset * scale;
  const s = scale;

  return (
    <g
      key={pulseKey}
      transform={`translate(${cx + ox}, ${cy + oy}) rotate(${angle})`}
      className={onSelect ? "car-marker-hit" : undefined}
      style={onSelect ? { cursor: "pointer" } : undefined}
      onPointerDown={
        onSelect
          ? (e) => {
              e.stopPropagation();
            }
          : undefined
      }
      onClick={
        onSelect
          ? (e) => {
              e.stopPropagation();
              e.preventDefault();
              onSelect();
            }
          : undefined
      }
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onSelect();
              }
            }
          : undefined
      }
      aria-label={
        onSelect
          ? `Open racer card${code ? ` for ${code}` : ""}${number != null ? ` #${number}` : ""}`
          : undefined
      }
    >
      {glow && (
        <ellipse
          cx={0}
          cy={0}
          rx={20 * s}
          ry={9 * s}
          fill={fill}
          opacity="0.22"
          filter="blur(3.5px)"
          className={pulseKey ? "car-marker-pulse" : undefined}
        />
      )}
      {/* Hit target */}
      <ellipse
        cx={0}
        cy={0}
        rx={24 * s}
        ry={14 * s}
        fill="transparent"
        stroke="none"
      />

      {/* Rear wing + endplates */}
      <rect
        x={-17.5 * s}
        y={-9 * s}
        width={3.8 * s}
        height={18 * s}
        rx={0.5 * s}
        fill={second}
        stroke="rgba(5,7,10,0.8)"
        strokeWidth={0.55 * s}
      />
      <rect
        x={-16.6 * s}
        y={-7 * s}
        width={1.6 * s}
        height={14 * s}
        rx={0.25 * s}
        fill="rgba(5,7,10,0.5)"
      />
      <rect
        x={-19 * s}
        y={-9.5 * s}
        width={1.2 * s}
        height={19 * s}
        rx={0.2 * s}
        fill={fill}
        opacity="0.85"
      />
      <rect
        x={-14.2 * s}
        y={-9.5 * s}
        width={1.2 * s}
        height={19 * s}
        rx={0.2 * s}
        fill={fill}
        opacity="0.85"
      />

      {/* Floor / barge boards */}
      <path
        d={`M ${-12 * s} ${-7.2 * s} L ${8 * s} ${-5.2 * s} L ${10.5 * s} ${-2.6 * s} L ${10.5 * s} ${2.6 * s} L ${8 * s} ${5.2 * s} L ${-12 * s} ${7.2 * s} Z`}
        fill={fill}
        stroke="rgba(5,7,10,0.85)"
        strokeWidth={1.05 * s}
      />
      {/* Sidepod inlet shading */}
      <path
        d={`M ${-9 * s} ${-3.8 * s} L ${5 * s} ${-2.8 * s} L ${6 * s} ${2.8 * s} L ${-9 * s} ${3.8 * s} Z`}
        fill="rgba(5,7,10,0.32)"
      />
      <path
        d={`M ${-6 * s} ${-2.2 * s} L ${2 * s} ${-1.6 * s}`}
        stroke="rgba(242,246,251,0.28)"
        strokeWidth={0.55 * s}
      />

      {/* Nose */}
      <path
        d={`M ${8 * s} ${-2.3 * s} L ${19 * s} 0 L ${8 * s} ${2.3 * s} Z`}
        fill={fill}
        stroke="rgba(5,7,10,0.75)"
        strokeWidth={0.85 * s}
      />
      <path
        d={`M ${10 * s} ${-1.1 * s} L ${16.5 * s} 0 L ${10 * s} ${1.1 * s} Z`}
        fill="rgba(242,246,251,0.18)"
      />

      {/* Front wing */}
      <rect
        x={15.5 * s}
        y={-8 * s}
        width={2.9 * s}
        height={16 * s}
        rx={0.4 * s}
        fill={second}
        opacity="0.96"
      />
      <line
        x1={16.9 * s}
        y1={-6.2 * s}
        x2={16.9 * s}
        y2={6.2 * s}
        stroke="rgba(242,246,251,0.4)"
        strokeWidth={0.5 * s}
      />
      <line
        x1={17.6 * s}
        y1={-5 * s}
        x2={17.6 * s}
        y2={5 * s}
        stroke="rgba(5,7,10,0.35)"
        strokeWidth={0.4 * s}
      />

      {/* Halo / cockpit */}
      <ellipse
        cx={-0.8 * s}
        cy={0}
        rx={3.6 * s}
        ry={2.7 * s}
        fill="rgba(5,7,10,0.7)"
        stroke="rgba(242,246,251,0.45)"
        strokeWidth={0.8 * s}
      />
      <path
        d={`M ${-2.6 * s} ${-1.7 * s} Q ${0.2 * s} ${-2.6 * s} ${2 * s} ${-1.2 * s}`}
        fill="none"
        stroke={second}
        strokeWidth={0.7 * s}
        strokeLinecap="round"
      />
      <path
        d={`M ${-1.8 * s} ${-1.4 * s} L ${1.4 * s} ${-1 * s}`}
        stroke="rgba(242,246,251,0.55)"
        strokeWidth={0.5 * s}
        strokeLinecap="round"
      />

      {/* Wheels with rim highlight */}
      <WheelTop cx={9 * s} cy={-6.6 * s} rx={2.5 * s} ry={1.65 * s} fill={fill} />
      <WheelTop cx={9 * s} cy={6.6 * s} rx={2.5 * s} ry={1.65 * s} fill={fill} />
      <WheelTop
        cx={-10 * s}
        cy={-7 * s}
        rx={2.75 * s}
        ry={1.8 * s}
        fill={fill}
      />
      <WheelTop
        cx={-10 * s}
        cy={7 * s}
        rx={2.75 * s}
        ry={1.8 * s}
        fill={fill}
      />

      {number != null && (
        <text
          x="0"
          y={-15.5 * s}
          textAnchor="middle"
          fill={fill}
          fontSize={14 * s}
          fontFamily="var(--font-mono), monospace"
          fontWeight="800"
          transform={`rotate(${-angle})`}
          style={{
            paintOrder: "stroke",
            stroke: "rgba(5,7,10,0.9)",
            strokeWidth: 3.2 * s,
          }}
        >
          {number}
        </text>
      )}
      {code && (
        <text
          x="0"
          y={19.5 * s}
          textAnchor="middle"
          fill={fill}
          fontSize={9.5 * s}
          fontFamily="var(--font-mono), monospace"
          fontWeight="700"
          transform={`rotate(${-angle})`}
          style={{
            paintOrder: "stroke",
            stroke: "rgba(5,7,10,0.92)",
            strokeWidth: 2.4 * s,
          }}
        >
          {code}
        </text>
      )}
    </g>
  );
}

function WheelTop({
  cx,
  cy,
  rx,
  ry,
  fill,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
}) {
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="#080a0e"
        stroke="rgba(242,246,251,0.35)"
        strokeWidth={rx * 0.22}
      />
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx * 0.42}
        ry={ry * 0.42}
        fill={fill}
        opacity="0.55"
      />
    </g>
  );
}
