export interface TranscriptResponse {
  text?: string;
  jobId?: string;
  content?: string;
  transcript?: string;
  data?: { text?: string };
  [key: string]: unknown;
}

export interface YouTubeVideoResponse {
  items?: Array<{
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
  }>;
}
