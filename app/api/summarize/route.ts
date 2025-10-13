// ✅ Force Node runtime (important for xml2js)
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";
import { generateText } from "ai";
import { google } from "@/lib/gemini";
import { CaptionTrack, ParsedTranscript, TranscriptEntry } from "@/types";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");
  const language = searchParams.get("lang") || "en";

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
    // ✅ Step 1: Fetch YouTube HTML (add headers to mimic browser)
    const htmlResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await htmlResponse.text();
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!apiKeyMatch) throw new Error("INNERTUBE_API_KEY not found");
    const apiKey = apiKeyMatch[1];

    // ✅ Step 2: Get player data
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

    // ✅ Step 3: Safely extract captions
    const tracks = playerData?.captions?.playerCaptionsTracklistRenderer
      ?.captionTracks as Array<CaptionTrack> | undefined;

    if (!tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: "No subtitles available for this video." },
        { status: 404 }
      );
    }

    const track =
      tracks.find((t) => t.languageCode === language) ||
      tracks.find((t) => t.languageCode.startsWith("en")) ||
      tracks[0]; // fallback to first track if specific lang not found

    if (!track) {
      return NextResponse.json(
        { error: `No captions found for language: ${language}` },
        { status: 404 }
      );
    }

    const baseUrl = track.baseUrl.replace(/&fmt=\w+$/, "");

    // ✅ Step 4: Fetch captions XML (with headers)
    const xmlResponse = await fetch(baseUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!xmlResponse.ok) throw new Error("Failed to fetch captions XML");

    const xml = await xmlResponse.text();
    const parsed = (await parseStringPromise(xml)) as ParsedTranscript;

    const transcript: TranscriptEntry[] = Array.isArray(parsed.transcript?.text)
      ? parsed.transcript.text.map((entry) => ({
          text: entry._,
          start: parseFloat(entry.$.start),
          duration: parseFloat(entry.$.dur),
          end: parseFloat(entry.$.start) + parseFloat(entry.$.dur),
        }))
      : [];

    if (transcript.length === 0) throw new Error("Empty subtitle data.");

    // ✅ Step 5: Combine into one string
    const text = transcript.map((entry) => entry.text).join(" ");

    // ✅ Step 6: Summarize with Gemini
    const prompt = `
You are a helpful assistant. Summarize the following YouTube transcript clearly and concisely.

Transcript:
"${text}"

Return valid JSON:
{
  "overview": "2–3 sentence summary of the video",
  "mainTopics": ["Main topics or ideas discussed"],
  "keyPoints": ["Key lessons or bullet points"],
  "insights": "Key insights or conclusions",
  "tags": ["3–5 relevant keywords"]
}
`;

    const { text: summary } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    // ✅ Return combined response
    return NextResponse.json({
      videoId,
      title,
      thumbnail,
      channelName,
      channelUrl,
      duration: formattedDuration,
      viewCount,
      language,
      text,
      summary,
    });
  } catch (error: unknown) {
    console.error("Transcript extraction failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
