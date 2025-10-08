"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Copy,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface SummaryData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  createdAt: string;
  tags: string[];
  channelName?: string;
  viewCount?: string;
  summary: string;
  transcript?: string;
  keyPoints?: string[];
}

// Mock data - replace with real data fetching
const mockSummaryData: Record<string, SummaryData> = {
  "1": {
    id: "1",
    title: "How to Build a SaaS with Next.js",
    videoUrl: "https://youtube.com/watch?v=example1",
    thumbnail: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
    duration: "25:30",
    createdAt: "2024-01-15",
    tags: ["Next.js", "SaaS", "Tutorial"],
    channelName: "Tech With Tim",
    viewCount: "125K views",
    summary: `This comprehensive tutorial covers everything you need to know about building a modern SaaS application with Next.js 14. 

## Key Topics Covered:

### 1. Project Setup & Architecture
- Setting up Next.js 14 with App Router
- TypeScript configuration
- Database setup with Prisma and PostgreSQL
- Authentication with NextAuth.js

### 2. Core Features Implementation
- User registration and login system
- Subscription management with Stripe
- Dashboard and user interface design
- API routes and server components

### 3. Advanced Features
- Real-time notifications
- File upload and management
- Email integration with Resend
- SEO optimization and metadata

### 4. Deployment & Production
- Vercel deployment configuration
- Environment variables setup
- Database migrations
- Performance optimization

## Key Takeaways:
- Next.js 14 App Router provides excellent developer experience
- Server components significantly improve performance
- Proper authentication is crucial for SaaS applications
- Stripe integration requires careful webhook handling
- Database design impacts scalability

This tutorial is perfect for developers looking to build their first SaaS product or upgrade their existing Next.js knowledge to the latest version.`,
    transcript: `[00:00] Welcome to this comprehensive tutorial on building a SaaS application with Next.js 14...

[02:30] First, let's set up our project structure. We'll be using the new App Router which provides better performance...

[05:15] Authentication is crucial for any SaaS application. We'll implement this using NextAuth.js...

[10:45] Now let's integrate Stripe for subscription management. This involves setting up webhooks...

[15:20] The dashboard is the heart of our application. We'll use server components for better performance...

[20:10] Finally, let's deploy our application to Vercel and configure our environment variables...`,
    keyPoints: [
      "Next.js 14 App Router architecture",
      "Authentication with NextAuth.js",
      "Stripe subscription integration",
      "Database design with Prisma",
      "Deployment best practices",
    ],
  },
};

interface SummaryPageProps {
  params: {
    summaryId: string;
  };
}

export default function SummaryPage({ params }: SummaryPageProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const summaryData =
      mockSummaryData[params.summaryId as keyof typeof mockSummaryData];
    setSummary(summaryData);
  }, [params.summaryId]);

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading summary...</p>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: summary.title,
          text: "Check out this AI-generated video summary",
          url: window.location.href,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 py-4">
              <Link
                href="/library"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Library</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {copied ? (
                  <Copy className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="relative aspect-video bg-gray-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8" />
                </div>
                <p className="mb-4">Video Preview</p>
                <a
                  href={summary.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch on YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Video Details */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {summary.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(summary.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{summary.duration}</span>
              </div>
              {summary.channelName && (
                <div className="flex items-center gap-1">
                  <span>by {summary.channelName}</span>
                </div>
              )}
              {summary.viewCount && (
                <div className="flex items-center gap-1">
                  <span>{summary.viewCount}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {summary.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">AI Summary</h2>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="prose prose-gray max-w-none">
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: summary.summary
                  .replace(
                    /### (.*)/g,
                    '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>'
                  )
                  .replace(
                    /## (.*)/g,
                    '<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h2>'
                  )
                  .replace(/- (.*)/g, '<li class="ml-4">$1</li>'),
              }}
            />
          </div>
        </div>

        {/* Key Points */}
        {summary.keyPoints && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Key Points
            </h2>
            <ul className="space-y-2">
              {summary.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript Toggle */}
        {summary.transcript && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Transcript
              </h2>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showTranscript ? "Hide" : "Show"} Transcript
              </button>
            </div>

            {showTranscript && (
              <div className="border-t pt-4">
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {summary.transcript}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
