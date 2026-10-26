import type { Metadata } from "next";
import { IBM_Plex_Mono, Oxanium, Sora } from "next/font/google";
import { PRODUCT, STUDIO, TAGLINE } from "@/lib/brand";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${PRODUCT} — ${STUDIO}`,
  description: `${TAGLINE} ${STUDIO} portfolio: evidence-bound session RAG on 2026 COTA FP2 telemetry beside ATLAS-shaped overlays.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oxanium.variable} ${sora.variable} ${plexMono.variable} min-h-dvh bg-[var(--void)] font-ui text-[var(--chalk)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
