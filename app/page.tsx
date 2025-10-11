"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  History,
  Zap,
  BookOpen,
  User,
  CheckCircle,
  Loader,
  X,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { text: "Analyzing video...", duration: 1500 },
    { text: "Fetching transcript...", duration: 2000 },
    { text: "Processing with AI...", duration: 2500 },
    { text: "Generating summary...", duration: 1500 },
    { text: "Finalizing results...", duration: 1000 },
  ];

  const simulateSummarization = async () => {
    if (!url.trim()) return;

    setIsProcessing(true);
    setProgress(0);
    setIsComplete(false);

    try {
      // Step 1: Analyzing video
      setCurrentStep("Analyzing video...");
      setProgress(20);

      // Step 2: Fetching transcript
      setCurrentStep("Fetching transcript...");
      setProgress(40);

      // Make API call to your endpoint
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        // Try to get error details from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${
            errorData.error || errorData.message || "Unknown error"
          }`;
          console.log("Full error response:", errorData);
        } catch {
          // If we can't parse the error response, just use the status
          console.log("Could not parse error response");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Console log the full response and transcript
      console.log("Full API response:", data);
      console.log("Transcript received:", data.transcript);

      // Step 3: Processing complete
      setCurrentStep("Processing with AI...");
      setProgress(70);

      // Brief pause to show the step
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Finalizing
      setCurrentStep("Finalizing results...");
      setProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Complete
      setProgress(100);
      setIsComplete(true);
      setCurrentStep("Summary ready!");
    } catch (error) {
      console.error("Error processing video:", error);

      // Handle different types of errors with specific messages
      if (error instanceof Error) {
        if (
          error.message.includes("404") &&
          error.message.includes("No transcript available")
        ) {
          setCurrentStep(
            "No captions available for this video. Try a different video with subtitles."
          );
        } else if (error.message.includes("Invalid YouTube URL")) {
          setCurrentStep("Please enter a valid YouTube URL.");
        } else if (error.message.includes("Video unavailable")) {
          setCurrentStep("Video is private or unavailable.");
        } else {
          setCurrentStep("Error occurred. Please try again.");
        }
      } else {
        setCurrentStep("Error occurred. Please try again.");
      }

      // Reset after showing error
      setTimeout(() => {
        closeModal();
      }, 5000); // Increased time to 5 seconds to read the error
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
      <header className="flex justify-between -mt-10 items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 ">
          <Image
            src="/images/logo.png"
            alt="ClipMind Logo"
            width={302}
            height={102}
          />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/library">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Library</span>
            </button>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition-colors">
            <User className="w-5 h-5" />
            <span>Login</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-[20px] text-center">
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Summarize YouTube Videos
          </h1>
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get instant, AI-powered summaries of any YouTube video. Save time
            and extract key insights in seconds.
          </p>
        </div>

        <div className="mb-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              />
              <button
                onClick={simulateSummarization}
                disabled={!url.trim() || !isValidYouTubeUrl(url)}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Summarize</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              For your privacy, your summary data will not be stored until you
              <Link
                href="/login"
                className="text-purple-600 ml-1 hover:underline"
              >
                sign in.
              </Link>
            </p>
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

      {/* Progress Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!isComplete ? (
              // Processing State
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

                {/* Progress Bar */}
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

                {/* Processing Steps */}
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
              // Completion State
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Summary Complete!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your AI-powered summary is ready to view
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href="/summary/1" className="flex-1">
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
