"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Share2,
  Copy,
  Calendar,
  ExternalLink,
  Download,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import { useSummaryStore } from "@/store/summaryStore";
// import { formatViewCount } from "@/lib/formatCount";
import Tags from "@/components/Tags";

export default function SummaryPage() {
  const params = useParams();
  const summaryId = params.id as string;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);
  const { getSummaryById } = useSummaryStore();

  // Get summary data from store
  const summary = getSummaryById(summaryId);

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

  // const result = formatViewCount(summary.viewCount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const decodeHtmlEntities = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
  };

  const rawSummary = summary.summary;

  // Parse JSON summary if it exists
  let parsedSummary: {
    overview?: string;
    mainTopics?: string[];
    keyPoints?: string[];
    insights?: string;
    tags?: string[];
  } | null = null;
  let cleanedSummary = "";
  let mainTopicsText = "";
  let keyInsightsText = "";
  let keyPoints: Array<{ bold: string; text: string }> = [];
  let tags: string[] = [];

  try {
    // Check if the summary is JSON format
    if (rawSummary.includes("```json")) {
      const jsonMatch = rawSummary.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedSummary = JSON.parse(jsonMatch[1]);

        if (parsedSummary) {
          // Extract data from JSON structure
          cleanedSummary = parsedSummary.overview || "";
          mainTopicsText = Array.isArray(parsedSummary.mainTopics)
            ? parsedSummary.mainTopics.join("\n\n")
            : parsedSummary.mainTopics || "";
          keyInsightsText = parsedSummary.insights || "";

          // Format key points - use full text as normal text (no bold splitting)
          if (Array.isArray(parsedSummary.keyPoints)) {
            keyPoints = parsedSummary.keyPoints.map((point: string) => ({
              bold: point.trim(),
              text: "", // No text part since we want full text as normal
            }));
          }

          // Extract tags
          tags = Array.isArray(parsedSummary.tags) ? parsedSummary.tags : [];

          localStorage.setItem("tags", JSON.stringify(tags));
        }
      }
    } else {
      // Fallback to old text parsing - Step 1: Remove the intro and tags section
      cleanedSummary = rawSummary
        .replace(/^Here.*?:\s*/, "") // remove "Here's a summary of..."
        .replace(/\*\*Tags:[\s\S]*$/i, "") // remove tags section
        .trim();

      // Step 2: Extract Key Points section
      const keyPointsMatch = cleanedSummary.match(
        /\*\*Key Points:\*\*([\s\S]*?)(\n\n|\Z)/
      );
      const keyPointsText = keyPointsMatch ? keyPointsMatch[1] : "";

      // Step 3: Split and format each key point
      keyPoints = keyPointsText
        .split(/\n\*\s+/)
        .map((point) => point.replace(/\*\*/g, "").trim())
        .filter((point) => point.length > 0)
        .map((point) => {
          const [boldPart, ...rest] = point.split(":");
          return {
            bold: boldPart.trim(),
            text: rest.join(":").trim(),
          };
        });

      // Step 4: Extract Main Topics section
      const mainTopicsMatch = cleanedSummary.match(
        /\*\*Main topics or ideas discussed:\*\*([\s\S]*?)(\n\n|\*\*|\Z)/i
      );
      mainTopicsText = mainTopicsMatch ? mainTopicsMatch[1].trim() : "";

      // Step 5: Extract Key Insights section
      const patterns = [
        /Key insights (?:and|or) conclusions:?\s*([\s\S]*?)(\n\n|\Z)/i,
        /Key insights:?\s*([\s\S]*?)(\n\n|\Z)/i,
        /Insights:?\s*([\s\S]*?)(\n\n|\Z)/i,
      ];

      for (const pattern of patterns) {
        const match = cleanedSummary.match(pattern);
        if (match && match[1].trim()) {
          keyInsightsText = match[1].trim();
          break;
        }
      }

      // Step 6: Remove extracted sections from cleaned summary
      cleanedSummary = cleanedSummary
        .replace(/\*\*Key Points:\*\*[\s\S]*?(\n\n|\Z)/, "")
        .replace(
          /\*\*Main topics or ideas discussed:\*\*[\s\S]*?(\n\n|\*\*|\Z)/i,
          ""
        )
        .replace(
          /Key insights (?:and|or) conclusions:?\s*[\s\S]*?(\n\n|\Z)/i,
          ""
        )
        .replace(/Key insights:?\s*[\s\S]*?(\n\n|\Z)/i, "")
        .trim();

      // Extract tags from old format
      const match = rawSummary.match(/\[([^\]]+)\]/);
      if (match) {
        try {
          tags = JSON.parse(match[0]);
        } catch {}
      }
    }
  } catch (error) {
    console.error("Error parsing summary:", error);
    cleanedSummary = rawSummary;
  }

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
          <div className="relative aspect-video bg-gray-900 group cursor-pointer">
            {summary.thumbnail ? (
              <Image
                src={summary.thumbnail}
                alt={summary.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800" />
            )}

            {/* Overlay with play button and YouTube link */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
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
              {/* <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{summary.duration}</span>
              </div> */}
              {summary.channelName && (
                <div className="flex items-center gap-1">
                  <span>by {summary.channelName}</span>
                </div>
              )}
              {/* {summary.viewCount && (
                <div className="flex items-center gap-1">
                  <span>{result} views</span>
                </div>
              )} */}
            </div>

            <Tags tags={tags} />
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

          <div className="prose prose-purple">
            <ReactMarkdown>{cleanedSummary}</ReactMarkdown>
          </div>
        </div>

        {/* Main Topics */}
        {mainTopicsText && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Main Topics
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {mainTopicsText}
              </p>
            </div>
          </div>
        )}

        {/* Key Insights */}
        {keyInsightsText && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Key Insights
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {keyInsightsText}
              </p>
            </div>
          </div>
        )}

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Key Points
            </h2>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">
                    {point.text ? (
                      <>
                        <strong>{point.bold}:</strong> {point.text}
                      </>
                    ) : (
                      point.bold
                    )}
                  </span>
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
                    {decodeHtmlEntities(summary.transcript)}
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
