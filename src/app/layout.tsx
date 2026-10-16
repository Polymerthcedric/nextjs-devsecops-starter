import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevSecOps Starter — Secure Next.js boilerplate",
    template: "%s | DevSecOps Starter",
  },
  description:
    "A Next.js starter with request rate limiting, role-based route checks, and PBKDF2 password hashing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    url: "https://starter.fidelco.dev/",
    siteName: "DevSecOps Starter",
    title: "DevSecOps Starter",
    description:
      "A Next.js starter with rate limiting, role-based route checks, and PBKDF2 password hashing.",
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
      "A Next.js starter with rate limiting, role-based route checks, and PBKDF2 password hashing.",
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
