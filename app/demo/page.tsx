"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="flex justify-between -mt-10 items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="ClipMind Logo"
              width={302}
              height={102}
              className="cursor-pointer"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/library">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Library</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home </span>
        </Link>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See ClipMind in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how easy it is to transform any YouTube video into an
            intelligent summary with key insights, topics, and actionable
            takeaways.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="aspect-video rounded-xl overflow-hidden">
            <video
              controls
              className="w-full h-full object-cover"
              preload="metadata"
            >
              <source src="/images/video.mov" type="video/quicktime" />
              <source src="/images/video.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </main>
    </div>
  );
}
