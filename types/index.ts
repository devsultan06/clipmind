export interface CaptionTrack {
  languageCode: string;
  baseUrl: string;
}

export interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
  end: number;
}

export interface ParsedTranscript {
  transcript?: {
    text?: Array<{
      _: string;
      $: {
        start: string;
        dur: string;
      };
    }>;
  };
}
