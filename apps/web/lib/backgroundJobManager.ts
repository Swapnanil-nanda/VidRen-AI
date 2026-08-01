// ============================================================
// Background Job & Video Result Storage Manager
// Saves active video projects and finished video URLs to IndexedDB / localStorage
// so users never lose rendering work if they switch tabs, close window, or return later.
// ============================================================

import { VideoProject } from "../types";
import { NarrationSegment } from "./videoCompositor";

export interface StoredJob {
  id: string;
  prompt: string;
  timestamp: number;
  status: "rendering" | "complete" | "error";
  project?: VideoProject;
  videoUrl?: string;
  videoDuration?: number;
  narrationSegments?: NarrationSegment[];
}

const STORAGE_KEY = "vidren_background_jobs_v1";

export function saveJobToStorage(job: StoredJob): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredJobs();
    const filtered = existing.filter((j) => j.id !== job.id);
    filtered.unshift(job);
    const trimmed = filtered.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("Failed to save job to localStorage:", err);
  }
}

export function getStoredJobs(): StoredJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getLatestStoredJob(): StoredJob | null {
  const jobs = getStoredJobs();
  return jobs.length > 0 ? jobs[0] : null;
}

export function clearJobStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear job storage:", err);
  }
}
