"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  History,
  Zap,
  BookOpen,
  CheckCircle,
  Loader,
  X,
  ExternalLink,
} from "lucide-react";
import { useSummaryStore } from "@/store/summaryStore";

const formattedDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Home() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [title, setTitle] = useState("");
  const { addSummary } = useSummaryStore();
  type SummaryData = {
    videoId: string;
    title: string;
    thumbnail: string;
    channelName: string;
    channelUrl: string;
    duration: string;
    viewCount: number;
    summary: string;
    transcript: string;
    videoUrl: string;
  };

  const [data, setData] = useState<SummaryData | null>(null);

  const steps = [
    { text: "Analyzing video..." },
    { text: "Fetching transcript & generating summary..." },
    { text: "Finalizing results..." },
  ];

  const processVideo = async () => {
    if (!url.trim()) return;

    setIsProcessing(true);
    setProgress(0);
    setIsComplete(false);

    try {
      // Step 1: Analyzing video
      setCurrentStep("Analyzing video...");
      setProgress(20);

      // Small delay to show this step
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 2: Fetching transcript & AI processing (this is where the real work happens)
      setCurrentStep("Fetching transcript & generating summary...");
      setProgress(33);

      const response = await fetch(
        `/api/test?url=${encodeURIComponent(url.trim())}&lang=en`,
        {
          method: "GET",
          redirect: "follow",
        }
      );

      if (!response.ok) {
        // Try to get error details from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${
            errorData.error || errorData.message || "Unknown error"
          }`;
          console.log("Full error response:", errorData);
          setCurrentStep(
            `Error: ${errorData.error || errorData.message || "Unknown error"}`
          );
        } catch {
          // If we can't parse the error response, just use the status
          console.log("Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log("Summary API response:", data.playerData?.videoDetails.title);

      const {
        videoId,
        title,
        thumbnail,
        channelName,
        channelUrl,
        duration,
        viewCount,
        summary,
        text,
      } = data;

      setTitle(title);

      setData({
        videoId: videoId,
        title: title,
        thumbnail: thumbnail,
        channelName: channelName,
        channelUrl: channelUrl,
        duration: duration,
        viewCount: viewCount,
        summary: summary,
        transcript: text,
        videoUrl: url,
      });

      addSummary({
        id: videoId,
        title: title,
        videoUrl: url,
        createdAt: formattedDate,
        transcript: text,
        viewCount: viewCount,
        thumbnail: thumbnail,
        summary: summary,
        channelName: channelName,
        duration: duration,
        channelUrl: channelUrl,
      });

      // Step 3: Finalizing (API call is complete, summary is ready)
      setCurrentStep("Finalizing results...");
      setProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Complete
      setProgress(100);
      setIsComplete(true);
      setCurrentStep("Summary ready!");
    } catch (error) {
      console.error("Error processing video:", error);

      // Handle different types of errors with specific messages
      if (error instanceof Error) {
        if (error.message.includes("No captions found for this video")) {
          setCurrentStep(
            "No captions available for this video. Try a different video with subtitles."
          );
        } else if (error.message.includes("Invalid YouTube URL")) {
          setCurrentStep("Please enter a valid YouTube URL.");
        } else if (error.message.includes("Video unavailable")) {
          setCurrentStep("Video is private or unavailable.");
        } else if (error.message.includes("INNERTUBE_API_KEY not found")) {
          setCurrentStep("YouTube API issue. Please try again later.");
        } else {
          setCurrentStep("Error occurred. Please try again.");
        }
      } else {
        setCurrentStep("Error occurred. Please try again.");
      }

      // Reset after showing error
      setTimeout(() => {
        closeModal();
      }, 5000);
    }
  };

  const closeModal = () => {
    setIsProcessing(false);
    setIsComplete(false);
    setProgress(0);
    setCurrentStep("");
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="md:flex justify-between -mt-10 items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 ">
          <Image
            src="/images/logo.png"
            alt="ClipMind Logo"
            width={302}
            height={102}
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/demo">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Demo</span>
            </button>
          </Link>
          <Link href="/library">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Library</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-[20px] text-center">
        <div className="mb-16">
          <h1 className="text-3xl md:text-6xl font-bold text-gray-900 mb-1">
            Summarize YouTube Videos
          </h1>
          <h2 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get instant, AI-powered summaries of any YouTube video. Save time
            and extract key insights in seconds.
          </p>
        </div>

        <div className="mb-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="md:flex gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-4 py-3 w-full md:w-fit border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              />
              <button
                onClick={processVideo}
                disabled={!url.trim() || !isValidYouTubeUrl(url)}
                className="px-8 py-3 w-full md:w-fit justify-center md:mt-0 mt-[30px] bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Summarize</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 py-[10px] max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Advanced AI generates concise, accurate summaries
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Save History
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Access all your summaries anytime in your library
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Instant Results
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get summaries in seconds, not minutes
            </p>
          </div>
        </div>
      </main>

      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!isComplete ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Creating Your Summary
                  </h3>
                  <p className="text-gray-600 text-sm">{currentStep}</p>
                </div>

                <div className="mb-6">
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {Math.round(progress)}% complete
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  {steps.map((step, index) => {
                    const stepProgress = (progress / 100) * steps.length;
                    const isCurrentStep = Math.floor(stepProgress) === index;
                    const isCompleted = stepProgress > index;

                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-500"
                              : isCurrentStep
                              ? "bg-purple-600"
                              : "bg-gray-200"
                          }`}
                        >
                          {isCompleted && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                          {isCurrentStep && !isCompleted && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            isCurrentStep
                              ? "text-purple-600 font-medium"
                              : isCompleted
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Summary Complete!
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Your AI-powered summary is ready to view
                  </p>
                  {title && (
                    <p className="text-gray-800 font-medium text-sm">
                      &ldquo;{title}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link href={`/summary/${data?.videoId}`} className="flex-1">
                    <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Full Summary</span>
                    </button>
                  </Link>
                  <button
                    onClick={closeModal}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
