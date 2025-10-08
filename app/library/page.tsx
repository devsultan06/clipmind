"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  Play,
  Calendar,
  Share2,
  Trash2,
} from "lucide-react";

// Mock data - replace with real data from your database
const mockSummaries = [
  {
    id: "1",
    title: "How to Build a SaaS with Next.js",
    videoUrl: "https://youtube.com/watch?v=example1",
    thumbnail: "https://img.youtube.com/vi/example1/maxresdefault.jpg",
    summary:
      "A comprehensive guide on building scalable SaaS applications using Next.js, covering authentication, payments, and deployment.",
    duration: "25:30",
    createdAt: "2024-01-15",
    tags: ["Next.js", "SaaS", "Tutorial"],
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    videoUrl: "https://youtube.com/watch?v=example2",
    thumbnail: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
    summary:
      "Learn advanced React patterns including compound components, render props, and custom hooks for better code organization.",
    duration: "18:45",
    createdAt: "2024-01-14",
    tags: ["React", "Patterns", "JavaScript"],
  },
  {
    id: "3",
    title: "TypeScript Best Practices",
    videoUrl: "https://youtube.com/watch?v=example3",
    thumbnail: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
    summary:
      "Essential TypeScript best practices for writing maintainable and type-safe code in large applications.",
    duration: "32:15",
    createdAt: "2024-01-13",
    tags: ["TypeScript", "Best Practices", "Programming"],
  },
  {
    id: "4",
    title: "AI and Machine Learning Fundamentals",
    videoUrl: "https://youtube.com/watch?v=example4",
    thumbnail: "https://img.youtube.com/vi/example4/maxresdefault.jpg",
    summary:
      "Introduction to AI and ML concepts, covering neural networks, supervised learning, and practical applications.",
    duration: "45:20",
    createdAt: "2024-01-12",
    tags: ["AI", "Machine Learning", "Technology"],
  },
];

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter summaries based on search query
  const filteredSummaries = mockSummaries.filter(
    (summary) =>
      summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Sort summaries
  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Video Library
          </h1>
          <p className="text-gray-600">
            {filteredSummaries.length}{" "}
            {filteredSummaries.length === 1 ? "summary" : "summaries"}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search summaries by title or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {sortedSummaries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No summaries found" : "No summaries yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search query or clear the search to see all summaries."
                : "Start by summarizing your first YouTube video from the home page."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSummaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {summary.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {summary.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {summary.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {summary.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(summary.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/summary/${summary.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors text-center"
                    >
                      View Summary
                    </Link>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
