"use client";

import { useState } from "react";
import { HelmetMark } from "@/components/identity/HelmetMark";
import { headshotFor } from "@/lib/driver-media";
import { accentFor } from "@/lib/identity";
import type { Driver } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DriverPortrait({
  driver,
  size = 88,
  className,
}: {
  driver: Driver;
  size?: number;
  className?: string;
}) {
  const accent = accentFor(driver);
  const src = headshotFor(driver);
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute -inset-[2px] rounded-full opacity-90"
        style={{
          background: `conic-gradient(from 210deg, ${accent.accent}, ${accent.second}, ${accent.accent})`,
          boxShadow: `0 0 22px ${accent.accent}55`,
        }}
        aria-hidden
      />
      <div className="absolute inset-[3px] overflow-hidden rounded-full bg-[var(--asphalt)]">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt=""
            width={size}
            height={size}
            className="h-full w-full object-cover object-top"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--panel)]">
            <HelmetMark
              number={driver.number}
              accent={accent.accent}
              second={accent.second}
              size={Math.round(size * 0.78)}
            />
          </div>
        )}
      </div>
      {driver.number != null && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-mono text-[0.65rem] font-bold text-[var(--void)] shadow-[0_0_0_2px_var(--asphalt)]"
          style={{ background: accent.accent }}
        >
          {driver.number}
        </span>
      )}
    </div>
  );
}
