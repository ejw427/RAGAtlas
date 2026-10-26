import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-sm border border-[var(--hairline-strong)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--chalk)] placeholder:text-[var(--mute)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
