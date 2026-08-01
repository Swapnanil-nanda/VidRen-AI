import { VideoProject, VideoTargetDuration } from "../types";
import { planVideoProject } from "./aiPlanner";

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
  targetDuration?: VideoTargetDuration;
}

export type VisualLayout =
  | "process"
  | "timeline"
  | "comparison"
  | "architecture"
  | "equation"
  | "chart"
  | "simulation"
  | "hero3d"
  | "hero-object"
  | "process-flow";

export interface SceneScript {
  sceneNumber: number;
  title: string;
  narration: string;
  purpose?: string;
  duration: number;
  visualLayout?: VisualLayout;
  visualDescription?: string;
  keyElements?: string[];
  modelType?: string;
  visualBeats?: any;
  transition?: any;
}

export interface GeneratedScript {
  title: string;
  totalScenes: number;
  scenes: SceneScript[];
  summary: string;
}

export function getApiKey(): string | null {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
}

export async function generateProject(
  prompt: string,
  config: GeminiConfig = {}
): Promise<VideoProject> {
  return planVideoProject(prompt, {
    apiKey: config.apiKey || getApiKey() || undefined,
    model: config.model,
    targetDuration: config.targetDuration,
  });
}
