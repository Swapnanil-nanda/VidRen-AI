import { ScenePlan, VoiceOption, RenderConfig } from "../types";
import { createFrameRenderer } from "./sceneRenderer";
import { backgroundSleep } from "./backgroundTimer";

export interface CompositorConfig {
  width: number;
  height: number;
  fps: number;
  scenes: ScenePlan[];
  style: "modern" | "chalk";
  voiceOption: VoiceOption;
  apiKey?: string;
}

export interface CompositorProgress {
  stage: "rendering" | "voice" | "compositing" | "complete";
  currentScene: number;
  totalScenes: number;
  progress: number;
  message: string;
}

export interface NarrationSegment {
  text: string;
  startTime: number;
  duration: number;
}

export interface CompositorResult {
  videoBlob: Blob;
  videoDuration: number;
  videoUrl: string;
  narrationSegments: NarrationSegment[];
}

export function checkBrowserSupport() {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return { canRecord: false, supportedMimeType: null };
  }
  const supportedMimeType =
    ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || null;
  return { canRecord: Boolean(supportedMimeType), supportedMimeType };
}

export function buildNarrationTimeline(scenes: ScenePlan[]): NarrationSegment[] {
  const segments: NarrationSegment[] = [];
  let currentTime = 0;

  for (const scene of scenes) {
    const dur = Number(scene.duration) || 10;
    if (scene.narration) {
      segments.push({
        text: scene.narration,
        startTime: currentTime,
        duration: dur,
      });
    }
    currentTime += dur;
  }

  return segments;
}

/**
  100% Background-Resilient Video Compositor
  Uses captureStream(0) + manual track.requestFrame() + Web Worker background timers.
  This forces the browser to capture and record frames INSTANTLY in background tabs,
  window minimization, or when the user works in another application!
 */
export async function composeVideo(
  config: CompositorConfig,
  onProgress?: (progress: CompositorProgress) => void
): Promise<CompositorResult> {
  const { width, height, scenes, style } = config;
  const fps = Math.min(config.fps || 30, 30);

  const support = checkBrowserSupport();
  if (!support.canRecord) {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  const mimeType = support.supportedMimeType || "";

  // Create off-DOM canvas for rendering
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });

  if (!ctx) {
    throw new Error("Could not get 2D context for canvas.");
  }

  // captureStream(0) = Manual frame capture via requestFrame()
  const stream = canvas.captureStream ? canvas.captureStream(0) : (canvas as any).mozCaptureStream?.(0);
  const track = stream?.getVideoTracks?.()?.[0] as any;

  const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  const chunks: BlobPart[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || "video/webm" });
      resolve(blob);
    };
    mediaRecorder.onerror = (e) => reject(e);
  });

  mediaRecorder.start(50);

  let totalDuration = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const sceneDuration = Number(scene.duration) && Number(scene.duration) > 0 ? Number(scene.duration) : 10;

    onProgress?.({
      stage: "rendering",
      currentScene: i + 1,
      totalScenes: scenes.length,
      progress: Math.round((i / scenes.length) * 100),
      message: `Background rendering scene ${i + 1} of ${scenes.length} ("${scene.title}")`,
    });

    const renderConfig: RenderConfig = {
      width,
      height,
      fps,
      style,
    };

    const frameRenderer = createFrameRenderer(scene, renderConfig);
    const totalFrames = Math.ceil(sceneDuration * fps);

    for (let f = 0; f < totalFrames; f++) {
      const timestamp = f / fps;

      // 1. Draw frame onto 2D context
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, width, height);
      frameRenderer(ctx, timestamp, sceneDuration);

      // 2. Force manual frame capture into video recorder stream (works in background tabs!)
      if (track && typeof track.requestFrame === "function") {
        track.requestFrame();
      }

      // 3. Supercharged 4ms Web Worker background sleep for ultra-fast background completion
      await backgroundSleep(4);
    }

    totalDuration += sceneDuration;
  }

  // Force final frame request to ensure stream flush
  if (track && typeof track.requestFrame === "function") {
    track.requestFrame();
  }

  await backgroundSleep(50);
  mediaRecorder.stop();

  onProgress?.({
    stage: "compositing",
    currentScene: scenes.length,
    totalScenes: scenes.length,
    progress: 95,
    message: "Finalizing WebM video stream in background worker...",
  });

  const blob = await recordingPromise;
  const videoUrl = URL.createObjectURL(blob);
  const narrationSegments = buildNarrationTimeline(scenes);

  return {
    videoBlob: blob,
    videoDuration: totalDuration,
    videoUrl,
    narrationSegments,
  };
}
