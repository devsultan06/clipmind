import Image from "next/image";
import Link from "next/link";
import { Sparkles, History, Zap, BookOpen, User } from "lucide-react";

export default function Home() {
  return (
    <div className="h-[110vh] bg-gradient-to-br from-purple-50 to-blue-50">
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
                placeholder="Paste YouTube URL here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
              />
              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
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
    </div>
  );
}
