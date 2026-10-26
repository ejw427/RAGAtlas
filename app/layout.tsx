import type { Metadata } from "next";
import { IBM_Plex_Mono, Oxanium, Sora } from "next/font/google";
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
  title: "RAGAtlas — Ask the lap. Trust the trace.",
  description:
    "Portfolio prototype: session RAG grounded in sectors, channels, and engineer notes — beside ATLAS-shaped telemetry, not a clone.",
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
