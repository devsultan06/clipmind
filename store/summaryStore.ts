import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Summary {
  id: string;
  title: string;
  thumbnail: string | null;
  channelName: string;
  channelUrl: string | null;
  duration: string;
  viewCount: number;
  summary: string;
  transcript: string;
  videoUrl: string;
  createdAt: string;
}

interface SummaryStore {
  summaries: Summary[];
  addSummary: (summary: Summary) => void;
  deleteSummary: (id: string) => void;
  clearSummaries: () => void;
  getSummaryById: (id: string) => Summary | undefined;
}

export const useSummaryStore = create<SummaryStore>()(
  persist(
    (set, get) => ({
      summaries: [],
      addSummary: (summary) =>
        set((state) => ({
          summaries: [
            summary,
            ...state.summaries.filter((existing) => existing.id !== summary.id),
          ],
        })),
      deleteSummary: (id) =>
        set((state) => ({
          summaries: state.summaries.filter((summary) => summary.id !== id),
        })),
      getSummaryById: (id) => {
        const { summaries } = get();
        return summaries.find((summary: Summary) => summary.id === id);
      },

      clearSummaries: () => set({ summaries: [] }),
    }),
    {
      name: "summaries-storage", // Key for localStorage
    }
  )
);
