import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize Gemini
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
