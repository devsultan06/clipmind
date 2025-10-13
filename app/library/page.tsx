"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowLeft,
  Play,
  Calendar,
  Share2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useSummaryStore } from "@/store/summaryStore";
import Tags from "@/components/Tags";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [tags, setTags] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    summaryId: string;
    summaryTitle: string;
  }>({
    isOpen: false,
    summaryId: "",
    summaryTitle: "",
  });
  const { summaries, deleteSummary } = useSummaryStore();

  const handleDeleteSummary = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      summaryId: id,
      summaryTitle: title,
    });
  };

  const confirmDelete = () => {
    deleteSummary(deleteModal.summaryId);
    setDeleteModal({ isOpen: false, summaryId: "", summaryTitle: "" });
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, summaryId: "", summaryTitle: "" });
  };

  // Filter summaries based on search query
  const filteredSummaries = summaries.filter((summary) =>
    summary.title.toLowerCase().includes(searchQuery.toLowerCase())
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

  useEffect(() => {
    const tags = localStorage.getItem("tags");
    if (tags) {
      setTags(JSON.parse(tags));
    }
  }, []);

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
                  {summary.thumbnail ? (
                    <Image
                      src={summary.thumbnail}
                      alt={summary.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

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
                    {(() => {
                      try {
                        // Check if summary is JSON format
                        if (summary.summary.includes("```json")) {
                          const jsonMatch = summary.summary.match(
                            /```json\s*([\s\S]*?)\s*```/
                          );
                          if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[1]);
                            return parsed.overview || summary.summary;
                          }
                        }
                        return summary.summary;
                      } catch {
                        return summary.summary;
                      }
                    })()}
                  </p>

                  <div className="mb-3">
                    <Tags tags={tags} limit={3} />
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{summary.createdAt}</span>
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
                    <button
                      onClick={() =>
                        handleDeleteSummary(summary.id, summary.title)
                      }
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete summary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Summary
                </h3>
              </div>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this summary?
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">
                  &ldquo;{deleteModal.summaryTitle}&rdquo;
                </p>
              </div>
              <p className="text-sm text-red-600 mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
