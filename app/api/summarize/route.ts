import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }

    console.log("🎥 Processing video ID:", videoId);

    const youtube = await Innertube.create({ clientType: "WEB" });
    const info = await youtube.getInfo(videoId);
    let transcript = "";
    let transcriptSource = "";

    try {
      const captions = await info.getCaptions();
      const track = captions?.captionTracks?.[0];

      if (track?.baseUrl) {
        console.log("🗣️ Fetching captions from:", track.baseUrl);
        const xml = await fetch(track.baseUrl).then((r) => r.text());

        transcript = xml
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (transcript.length > 0) {
          transcriptSource = "youtube_captions";
          console.log("✅ Captions fetched successfully");
        }
      } else {
        console.log("❌ No captions found");
        return NextResponse.json(
          {
            error:
              "No captions available for this video. Please try another one.",
          },
          { status: 404 }
        );
      }
    } catch (err) {
      console.error("⚠️ Caption fetch failed:", err);
      return NextResponse.json(
        {
          error:
            "Failed to retrieve captions. The video might not have subtitles.",
        },
        { status: 500 }
      );
    }

    console.log("🤖 Generating summary with Gemini...");
    const prompt = `
      You are a video summarization assistant.
      Here's the transcript of a YouTube video:

      "${transcript}"

      Create a clear and concise summary that includes:
      1. A short overview (2-3 sentences)
      2. Main ideas or topics discussed
      3. Key insights or conclusions

      Write the summary in natural, readable English.
    `;

    const { text: summary } = await generateText({
      model: google("models/gemini-1.5-flash"),
      prompt,
    });

    return NextResponse.json({
      success: true,
      transcriptSource,
      videoTitle: info.basic_info.title,
      videoDuration: info.basic_info.duration?.text,
      transcriptLength: transcript.length,
      summaryLength: summary.length,
      transcript,
      summary,
      message: "Video summarized successfully",
    });
  } catch (error: unknown) {
    console.error("❌ Error in /api/summarize:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Unexpected error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
