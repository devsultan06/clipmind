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

  // Extract video ID from URL
  const videoIdMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // Fetch INNERTUBE_API_KEY from video page HTML
    const htmlResponse = await fetch(videoUrl);
    const html = await htmlResponse.text();
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (!apiKeyMatch) {
      throw new Error("INNERTUBE_API_KEY not found");
    }
    const apiKey = apiKeyMatch[1];

    // Get player response via InnerTube API
    const playerEndpoint = `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;
    const playerResponse = await fetch(playerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38",
          },
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

    // Step 3: Extract caption track base URL
    const tracks = playerData?.captions?.playerCaptionsTracklistRenderer
      ?.captionTracks as Array<CaptionTrack> | undefined;
    if (!tracks) {
      throw new Error("No captions found for this video");
    }
    const track = tracks.find((t: CaptionTrack) => t.languageCode === language);
    if (!track) {
      throw new Error(`No captions available for language: ${language}`);
    }
    const baseUrl: string = track.baseUrl.replace(/&fmt=\w+$/, "");

    // Step 4: Fetch and parse captions (XML parsing here)
    const xmlResponse = await fetch(baseUrl);
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

    // Combine transcript into single plain text
    const text = transcript.map((entry) => entry.text).join(" ");

    const prompt = `
You are a helpful assistant. Summarize the following YouTube transcript.

Transcript:
"${text}"

Return a JSON object with the following keys:
{
  "overview": "2–3 sentence summary of the video",
  "mainTopics": ["Main topics or ideas discussed"],
  "keyPoints": ["Key lessons or points in bullet format"],
  "insights": "Any key insights or conclusions",
  "tags": ["3–5 relevant keywords"]
}

Make sure the JSON is valid and parsable.
`;

    const { text: summary } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    // Return transcript, summary, and metadata
    return NextResponse.json({
      title,
      thumbnail,
      videoId,
      channelName,
      channelUrl,
      duration: formattedDuration,
      language,
      text,
      textLength: text.length,
      summary,
      summaryLength: summary.length,
      viewCount,
    });
  } catch (error: unknown) {
    console.error("Transcript extraction failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
