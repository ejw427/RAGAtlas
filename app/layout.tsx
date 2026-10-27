import type { Metadata } from "next";
import { IBM_Plex_Mono, Oxanium, Sora } from "next/font/google";
import { CfAnalytics } from "@/components/CfAnalytics";
import {
  LIVE_URL,
  PRODUCT,
  STUDIO,
  TAGLINE,
  WEDGE,
} from "@/lib/brand";
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

const description = `${WEDGE} ${TAGLINE} Evidence-bound session RAG on 2026 COTA FP2 telemetry — a ${STUDIO} portfolio piece.`;

export const metadata: Metadata = {
  metadataBase: new URL(LIVE_URL),
  title: {
    default: `${PRODUCT} — ${STUDIO}`,
    template: `%s · ${PRODUCT}`,
  },
  description,
  applicationName: PRODUCT,
  authors: [{ name: STUDIO, url: "https://www.welchsoftware.net" }],
  keywords: [
    "CiteTrace",
    "Welch Software",
    "session RAG",
    "motorsport telemetry",
    "COTA",
    "OpenF1",
    "ATLAS-shaped",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: LIVE_URL,
    siteName: `${PRODUCT} — ${STUDIO}`,
    title: `${PRODUCT} — ${STUDIO}`,
    description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CiteTrace — Circuit of the Americas Turn 1 climb, Austin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT} — ${STUDIO}`,
    description,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <CfAnalytics />
      </body>
    </html>
  );
}
