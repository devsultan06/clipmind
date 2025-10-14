// ✅ Ensure proper runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Supadata } from "@supadata/js";
import { generateText } from "ai";
import { google } from "@/lib/gemini";
import { TranscriptResponse, YouTubeVideoResponse } from "@/types";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter' },
      { status: 400 }
    );
  }

  // Extract video ID
  const videoIdMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // Fetch oEmbed metadata (title, thumbnail, channel info)
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${videoUrl}&format=json`
    );

    if (!oembedRes.ok) {
      throw new Error("Failed to fetch video metadata");
    }

    const oembed = await oembedRes.json();
    const title: string = oembed.title || "Unknown Title";
    const thumbnail: string | null = oembed.thumbnail_url || null;
    const channelName: string = oembed.author_name || "Unknown Creator";
    const channelUrl: string | null = oembed.author_url || null;

    // Fetch duration + view count using YouTube Data API
    let duration = "Unknown";
    let viewCount = 0;

    if (process.env.YOUTUBE_API_KEY) {
      const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
      const ytRes = await fetch(videoApiUrl);

      if (ytRes.ok) {
        const data: YouTubeVideoResponse = await ytRes.json();
        const video = data.items?.[0];

        if (video?.contentDetails?.duration) {
          duration = formatYouTubeDuration(video.contentDetails.duration);
        }
        if (video?.statistics?.viewCount) {
          viewCount = parseInt(video.statistics.viewCount, 10);
        }
      }
    }

    // Get transcript from Supadata
    const supadata = new Supadata({
      apiKey: process.env.SUPADATA_API_KEY as string,
    });

    const transcriptRaw = await supadata.youtube.transcript({
      url: videoUrl,
      lang: "en",
      text: true,
    });

    const transcriptResponse = transcriptRaw as unknown as TranscriptResponse;
    let result: string | undefined;

    if (transcriptResponse.text) {
      result = transcriptResponse.text;
    } else if (transcriptResponse.content) {
      result = transcriptResponse.content;
    } else if (transcriptResponse.transcript) {
      result = transcriptResponse.transcript;
    } else if (transcriptResponse.jobId) {
      let jobStatus = await supadata.transcript.getJobStatus(
        transcriptResponse.jobId
      );

      while (
        jobStatus.status !== "completed" &&
        jobStatus.status !== "failed"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        jobStatus = await supadata.transcript.getJobStatus(
          transcriptResponse.jobId
        );
      }

      if (jobStatus.status === "failed") {
        throw new Error(`Transcript job failed: ${jobStatus.error}`);
      }

      // Access transcript text from jobStatus with proper type assertion
      const jobResult = jobStatus as unknown as {
        content?: string;
        data?: { text?: string };
        result?: { text?: string; transcript?: string };
        [key: string]: unknown;
      };
      result =
        jobResult.content || jobResult.data?.text || jobResult.result?.text;
    } else {
      result = transcriptResponse.data?.text;
    }

    if (!result) {
      throw new Error("Transcript not found in response");
    }

    // Summarize transcript with Gemini
    const prompt = `
You are a helpful assistant. Summarize the following YouTube transcript clearly and concisely.

Transcript:
"${result}"

Return valid JSON:
{
  "overview": "2–3 sentence summary of the video",
  "mainTopics": ["Main topics or ideas discussed"],
  "keyPoints": ["Key lessons or bullet points"],
  "insights": "Key insights or conclusions",
  "tags": ["3–5 relevant keywords"]
}
`;

    const { text: summaryText } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    // Return final structured JSON
    return NextResponse.json({
      videoId,
      title,
      thumbnail,
      channelName,
      channelUrl,
      duration,
      viewCount,
      language: "en",
      text: result,
      summary: summaryText,
    });
  } catch (error) {
    console.error("❌ Transcript extraction failed:", error);
    return NextResponse.json(
      { error: "Failed to extract transcript" },
      { status: 500 }
    );
  }
}

function formatYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "Unknown";
  const hours = match[1] ? `${match[1]}h ` : "";
  const minutes = match[2] ? `${match[2]}m ` : "";
  const seconds = match[3] ? `${match[3]}s` : "";
  return `${hours}${minutes}${seconds}`.trim();
}
