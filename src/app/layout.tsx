import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevSecOps Starter — Secure Next.js boilerplate",
    template: "%s | DevSecOps Starter",
  },
  description:
    "A hyper-constrained Next.js starter with rate limiting, edge RBAC and PBKDF2 auth baked in. Secure by default, zero bloat — built to be licensed.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    url: "https://starter.fidelco.dev/",
    siteName: "DevSecOps Starter",
    title: "DevSecOps Starter",
    description:
      "Secure by default. Zero bloat. A Next.js starter with rate limiting, edge RBAC and PBKDF2 auth.",
    images: [
      {
        url: "https://starter.fidelco.dev/og.png",
        width: 1200,
        height: 630,
        alt: "DevSecOps Starter — secure-by-default Next.js boilerplate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSecOps Starter",
    description:
      "A secure-by-default Next.js boilerplate with rate limiting, edge RBAC and PBKDF2 auth.",
    images: ["https://starter.fidelco.dev/og.png"],
  },
  icons: {
    icon: {
      url: "/images/favicon.svg",
      type: "image/svg+xml",
    },
  },
  other: {
    "google-site-verification": "mht0HAr0s0Ii8LoYUngHkdtV5dnl3GLRd8PToaj0tF4",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
