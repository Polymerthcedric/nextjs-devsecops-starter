import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevSecOps Starter — open-source Next.js reference architecture",
    template: "%s | DevSecOps Starter",
  },
  description:
    "An open-source Next.js demo with Upstash rate limiting, role-based route checks, PBKDF2 auth, and a Paddle Sandbox checkout you can test with a test card.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    url: "https://starter.fidelco.dev/",
    siteName: "DevSecOps Starter",
    title: "DevSecOps Starter — open-source demo",
    description:
      "An open-source Next.js demo with rate limiting, role checks, PBKDF2 auth, and a Paddle Sandbox checkout.",
    images: [
      {
        url: "https://starter.fidelco.dev/og.png",
        width: 1200,
        height: 630,
        alt: "DevSecOps Starter — open-source Next.js reference architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSecOps Starter — open-source demo",
    description:
      "An open-source Next.js demo with rate limiting, role checks, PBKDF2 auth, and a Paddle Sandbox checkout.",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
