"use client";

import { HOUSE_SWITCHER } from "@/lib/identity";
import { cn } from "@/lib/utils";

export function HouseSwitcher({
  activeHouse,
  onSelect,
}: {
  activeHouse: string | null;
  onSelect: (houseId: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[var(--mist)]">
      <span className="hidden text-[var(--mute)] xl:inline">House</span>
      <select
        value={activeHouse ?? ""}
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
        aria-label="Walk-in house"
        className={cn(
          "max-w-[9.5rem] truncate border border-[var(--hairline)] bg-[var(--asphalt)] px-1.5 py-0.5 text-[var(--chalk)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]",
        )}
      >
        <option value="">Field</option>
        {HOUSE_SWITCHER.map((h) => (
          <option key={h.id} value={h.id}>
            {h.label}
          </option>
        ))}
      </select>
    </label>
  );
}
