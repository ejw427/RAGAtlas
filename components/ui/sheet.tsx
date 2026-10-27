"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  variant = "sheet",
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
  /** sheet = bottom / side drawer; popup = centered modal */
  variant?: "sheet" | "popup";
}) {
  const isPopup = variant === "popup";
  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cn(
          "fixed inset-0 z-40 data-[state=open]:animate-in",
          isPopup ? "bg-black/70 backdrop-blur-[2px]" : "bg-black/55",
        )}
      />
      <Dialog.Content
        className={cn(
          "z-50 overflow-auto border border-[var(--hairline-strong)] bg-[var(--rail)] shadow-2xl focus:outline-none",
          isPopup
            ? "fixed left-1/2 top-1/2 max-h-[min(92dvh,880px)] w-[min(100vw-1.25rem,560px)] -translate-x-1/2 -translate-y-1/2 rounded-lg p-4 sm:p-5"
            : "fixed inset-x-0 bottom-0 max-h-[72vh] rounded-t-md p-4",
          className,
        )}
        {...props}
      >
        {!isPopup && (
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--hairline-strong)]" />
        )}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={cn(
        "font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.14em] text-[var(--mute)]",
        className,
      )}
      {...props}
    />
  );
}
