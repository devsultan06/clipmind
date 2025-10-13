// ✅ Force Node runtime (important for external APIs)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Supadata } from "@supadata/js";
import { generateText } from "ai";
import { google } from "@/lib/gemini";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter' },
      { status: 400 }
    );
  }

  // ✅ Extract video ID
  const videoIdMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // ✅ Step 1: Get video details from YouTube
    const htmlResponse = await fetch(videoUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const html = await htmlResponse.text();
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!apiKeyMatch) throw new Error("INNERTUBE_API_KEY not found");
    const apiKey = apiKeyMatch[1];

    // ✅ Step 2: Get player data for video details
    const playerEndpoint = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;
    const playerResponse = await fetch(playerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: { clientName: "ANDROID", clientVersion: "20.10.38" },
        },
        videoId,
      }),
    });
    const playerData = await playerResponse.json();

    const videoDetails = playerData?.videoDetails || {};
    const title = videoDetails.title || "Unknown Title";
    const thumbnails = videoDetails.thumbnail?.thumbnails || [];
    const thumbnail =
      thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : null;

    const channelName = videoDetails.author || "Unknown Creator";
    const channelId = videoDetails.channelId;
    const channelUrl = channelId
      ? `https://www.youtube.com/channel/${channelId}`
      : null;

    const durationSeconds = parseInt(videoDetails.lengthSeconds || "0", 10);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const formattedDuration = `${minutes}m ${seconds}s`;
    const viewCount = parseInt(videoDetails.viewCount || "0", 10);

    // ✅ Step 3: Get transcript using Supadata
    const supadata = new Supadata({
      apiKey: process.env.SUPADATA_API_KEY as string,
    });

    // Request transcript
    const transcript = await supadata.youtube.transcript({
      url: videoUrl,
      lang: "en",
      text: true,
    });

    // Debug: Log the full response structure
    console.log(
      "Full transcript response:",
      JSON.stringify(transcript, null, 2)
    );

    // Handle direct text response or job-based response
    let result: string | undefined;

    // Type assertion helper with more possible properties
    const transcriptResponse = transcript as unknown as {
      text?: string;
      jobId?: string;
      data?: { text?: string };
      content?: string;
      transcript?: string;
      [key: string]: unknown;
    };

    // Check if response has direct text content
    if (transcriptResponse.text) {
      result = transcriptResponse.text;
    }
    // Check if response has content property
    else if (transcriptResponse.content) {
      result = transcriptResponse.content;
    }
    // Check if response has transcript property
    else if (transcriptResponse.transcript) {
      result = transcriptResponse.transcript;
    }
    // Check if response has jobId for polling
    else if (transcriptResponse.jobId) {
      let jobStatus = await supadata.transcript.getJobStatus(
        transcriptResponse.jobId
      );

      const jobStatusResponse = jobStatus as unknown as {
        status: string;
        error?: string | { message?: string };
        content?: string;
        data?: { text?: string };
      };

      while (
        jobStatusResponse.status !== "completed" &&
        jobStatusResponse.status !== "failed"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        jobStatus = await supadata.transcript.getJobStatus(
          transcriptResponse.jobId
        );
      }

      if (jobStatusResponse.status === "failed") {
        const errorMessage =
          typeof jobStatusResponse.error === "string"
            ? jobStatusResponse.error
            : jobStatusResponse.error?.message || "Unknown error";
        throw new Error(`Job failed: ${errorMessage}`);
      }

      result = jobStatusResponse.content || jobStatusResponse.data?.text;
    } else {
      // Handle other response formats - try to extract text from data property
      result = transcriptResponse.data?.text;

      // If still no result, log the structure and return error
      if (!result) {
        console.error(
          "Unable to extract transcript from response structure:",
          Object.keys(transcriptResponse)
        );
        throw new Error("Transcript not found in response");
      }
    }

    // ✅ Step 4: Summarize with Gemini AI
    let summary = "";
    if (result) {
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
      summary = summaryText;
    }

    // ✅ Return combined response with all video details
    return NextResponse.json({
      videoId,
      title,
      thumbnail,
      channelName,
      channelUrl,
      duration: formattedDuration,
      viewCount,
      language: "en",
      text: result,
      summary,
    });
  } catch (error) {
    console.error("Transcript extraction failed:", error);
    return NextResponse.json(
      { error: "Failed to extract transcript" },
      { status: 500 }
    );
  }
}
