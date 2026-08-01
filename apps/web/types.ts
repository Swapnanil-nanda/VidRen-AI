// ============================================================
// VidRen AI — Unified Type Definitions (Single Source of Truth)
// ============================================================

export type BoardStyle = "blackboard" | "greenboard" | "whiteboard";

export type Tool =
  | "pen"
  | "highlighter"
  | "eraser"
  | "text"
  | "shape"
  | "sticky"
  | "image"
  | "select"
  | "laser"
  | "3d";

export type ShapeType = "rectangle" | "circle" | "arrow" | "line";

export type AspectRatio = "16:9" | "9:16" | "1:1";

export type VoiceOption = "alloy" | "echo" | "fable" | "nova";

export type ExportFormat = "webm" | "gif" | "png" | "mp4";

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export type BgMusic = "none" | "lofi" | "ambient" | "rain";

// --- Modular Renderer Types & Visual Primitives ---

export type RendererType =
  | "process"
  | "timeline"
  | "comparison"
  | "architecture"
  | "hierarchy"
  | "equation"
  | "chart"
  | "piechart"
  | "simulation"
  | "hero3d";

export interface AnimationBeat {
  timestamp: number; // 0..1 relative progress or seconds within scene
  action: "enter" | "highlight" | "connect" | "transform" | "exit";
  targetId: string;
  description?: string;
}

export type ThreeDModelType =
  | "bloch-sphere"
  | "dna-helix"
  | "neural-net"
  | "pendulum-3d"
  | "torus-geometry"
  | "solar-orbit";

export interface VisualPrimitive {
  id: string;
  type: string;
  label?: string;
  detail?: string;
  x?: number; // 0..1 relative position
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  highlighted?: boolean;
  modelType?: ThreeDModelType;
  metadata?: Record<string, any>;
}

// --- Canvas Freehand Drawing Primitives ---

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: "pen" | "highlighter" | "eraser";
  opacity: number;
  timestamp: number;
}

export interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

export interface ImageElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  rotation: number;
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export interface ShapeElement {
  id: string;
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  fill: boolean;
  rotation: number;
}

export interface ThreeDObjectElement {
  id: string;
  modelType: ThreeDModelType;
  x: number;
  y: number;
  size: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  autoRotateSpeed: number;
  primaryColor: string;
  secondaryColor: string;
  title?: string;
}

export type CanvasElement =
  | ({ kind: "stroke" } & Stroke)
  | ({ kind: "text" } & TextElement)
  | ({ kind: "image" } & ImageElement)
  | ({ kind: "sticky" } & StickyNote)
  | ({ kind: "shape" } & ShapeElement)
  | ({ kind: "3d-object" } & ThreeDObjectElement);

export interface SubFrameBeat {
  id: string;
  timestamp: number; // 0..1 progress relative to scene duration
  title?: string;
  detail?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ScenePlan {
  id: string;
  sceneNumber: number;
  title: string;
  purpose: string;
  narration: string;
  duration: number; // seconds
  rendererType: RendererType;
  customImageUrl?: string; // Web image source or uploaded data URL
  customVideoUrl?: string; // Web video source
  subFrameBeats?: SubFrameBeat[]; // Multi-frame beats per scene
  visualLanguage: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  visualPrimitives: VisualPrimitive[];
  animationBeats: AnimationBeat[];
  cameraMotion?: "static" | "pan-right" | "zoom-in" | "zoom-out";
  // Freehand elements added by user overlay
  overlayElements?: CanvasElement[];
  boardStyle?: BoardStyle;
  thumbnail?: string;
}

export interface VideoProject {
  id: string;
  prompt: string;
  title: string;
  learningObjective: string;
  audienceLevel: "beginner" | "intermediate" | "advanced";
  scenes: ScenePlan[];
  aspectRatio: AspectRatio;
  voiceover: VoiceOption;
  bgMusic: BgMusic;
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias: Scene = ScenePlan, Project = VideoProject
export type Scene = ScenePlan;
export type Project = VideoProject;

// --- Pipeline Execution Types ---

export type PipelineStage =
  | "idle"
  | "analyzing"
  | "scripting"
  | "designing"
  | "classifying"
  | "planning"
  | "narration"
  | "rendering"
  | "compositing"
  | "complete"
  | "error";

export interface PipelineState {
  stage: PipelineStage;
  progress: number; // 0-100
  currentScene: number;
  totalScenes: number;
  message: string;
  error?: string;
}

export type VideoStyle = "modern" | "chalk";

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  style: VideoStyle;
}

export type VideoResolution = "720p" | "1080p" | "4k";

export const VIDEO_RESOLUTIONS: Record<VideoResolution, { width: number; height: number }> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 },
};

export type VideoTargetDuration = "quick" | "standard" | "deep_dive";

export const DURATION_CONFIGS: Record<
  VideoTargetDuration,
  { label: string; minScenes: number; maxScenes: number; sceneDuration: number; estimatedLength: string; description: string }
> = {
  quick: {
    label: "Quick Summary",
    minScenes: 4,
    maxScenes: 6,
    sceneDuration: 6,
    estimatedLength: "~25s - 40s",
    description: "Fast-paced concept overview with short punchy scenes",
  },
  standard: {
    label: "Standard Explainer",
    minScenes: 10,
    maxScenes: 15,
    sceneDuration: 10,
    estimatedLength: "1.5 - 2.5 min",
    description: "Balanced step-by-step breakdown",
  },
  deep_dive: {
    label: "Deep Dive Lecture",
    minScenes: 18,
    maxScenes: 30,
    sceneDuration: 14,
    estimatedLength: "4 - 7 min",
    description: "Full comprehensive lecture with detailed scene animations",
  },
};

export type LLMProvider = "gemini" | "openrouter" | "groq";
export type TTSProvider = "browser" | "elevenlabs" | "google-cloud";

export interface GeneratorSettings {
  llmProvider: LLMProvider;
  ttsProvider: TTSProvider;
  voiceOption: VoiceOption;
  resolution: VideoResolution;
  videoStyle: VideoStyle;
  targetDuration: VideoTargetDuration;
  apiKeys: {
    gemini?: string;
    openrouter?: string;
    groq?: string;
    elevenlabs?: string;
    googleCloud?: string;
  };
}

export const DEFAULT_GENERATOR_SETTINGS: GeneratorSettings = {
  llmProvider: "gemini",
  ttsProvider: "browser",
  voiceOption: "nova",
  resolution: "1080p",
  videoStyle: "modern",
  targetDuration: "standard",
  apiKeys: {},
};

export interface ToolbarState {
  activeTool: Tool;
  brushSize: number;
  activeColor: string;
  boardStyle: BoardStyle;
  shapeType: ShapeType;
  showGrid: boolean;
  showRuledLines: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  currentTime: number;
  totalDuration: number;
  isMuted: boolean;
  bgMusic: BgMusic;
  isFullscreen: boolean;
}

export const CHALK_COLORS = [
  "#FFFFFF",
  "#FFE066",
  "#63E6BE",
  "#74C0FC",
  "#E599F7",
  "#FF8787",
  "#FFA94D",
  "#A9E34B",
] as const;

export const BOARD_CONFIGS: Record<
  BoardStyle,
  { bg: string; gridColor: string; textDefault: string; label: string }
> = {
  blackboard: {
    bg: "#1a1a2e",
    gridColor: "rgba(255,255,255,0.04)",
    textDefault: "#FFFFFF",
    label: "Blackboard",
  },
  greenboard: {
    bg: "#1b3a2a",
    gridColor: "rgba(255,255,255,0.05)",
    textDefault: "#FFFFFF",
    label: "Greenboard",
  },
  whiteboard: {
    bg: "#f8f9fa",
    gridColor: "rgba(0,0,0,0.06)",
    textDefault: "#1a1a2e",
    label: "Whiteboard",
  },
};

export function createEmptyScenePlan(index: number): ScenePlan {
  return {
    id: `scene-${Date.now()}-${index}`,
    sceneNumber: index + 1,
    title: `Scene ${index + 1}`,
    purpose: "Concept Introduction",
    narration: "",
    duration: 10,
    rendererType: "process",
    visualLanguage: {
      theme: "dark",
      primaryColor: "#6366F1",
      secondaryColor: "#8B5CF6",
      accentColor: "#38BDF8",
    },
    visualPrimitives: [],
    animationBeats: [],
  };
}

export function createDefaultProject(title: string = "Untitled Video"): VideoProject {
  return {
    id: `project-${Date.now()}`,
    prompt: "",
    title,
    learningObjective: "General understanding",
    audienceLevel: "intermediate",
    scenes: [createEmptyScenePlan(0)],
    aspectRatio: "16:9",
    voiceover: "nova",
    bgMusic: "none",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export type AppView = "landing" | "generator" | "studio";
