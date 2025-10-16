import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "ClipMind - YouTube Video Summarizer",
  description:
    "Turn any YouTube video into a clear, human-readable summary. Simply paste a YouTube URL and get an AI-powered transcript summary instantly.",
  icons: {
    icon: [
      { url: "/images/logo.png" },
      { url: "/images/logo.png", sizes: "16x16", type: "image/png" },
      { url: "/images/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/images/logo.png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/images/logo.png",
      },
    ],
  },
  keywords: [
    "YouTube",
    "video",
    "summary",
    "transcript",
    "AI",
    "summarize",
    "ClipMind",
  ],
  authors: [{ name: "ClipMind" }],
  creator: "ClipMind",
  publisher: "ClipMind",
  openGraph: {
    title: "ClipMind - YouTube Video Summarizer",
    description:
      "Turn any YouTube video into a clear, human-readable summary. Simply paste a YouTube URL and get an AI-powered transcript summary instantly.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipMind - YouTube Video Summarizer",
    description:
      "Turn any YouTube video into a clear, human-readable summary. Simply paste a YouTube URL and get an AI-powered transcript summary instantly.",
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
      <Analytics />
      <body>{children}</body>
    </html>
  );
}
