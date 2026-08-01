import { VideoProject, ScenePlan, RendererType } from "../types";

export function validateScenePlan(data: any, index: number): ScenePlan {
  if (!data || typeof data !== "object") {
    throw new Error(`Scene ${index + 1} is not a valid object.`);
  }

  // Map visualLayout ("process-flow", "hero-3d", etc.) to internal RendererType
  let layoutStr = String(data.visualLayout || data.rendererType || "process").toLowerCase();
  layoutStr = layoutStr.replace("-flow", "").replace("-", "");

  const validRenderers: RendererType[] = [
    "process",
    "timeline",
    "comparison",
    "architecture",
    "equation",
    "chart",
    "hierarchy",
    "piechart",
    "simulation",
    "hero3d",
  ];

  let rendererType: RendererType = "process";
  if (validRenderers.includes(layoutStr as RendererType)) {
    rendererType = layoutStr as RendererType;
  } else if (layoutStr.includes("map") || layoutStr.includes("archival")) {
    rendererType = "timeline";
  } else if (layoutStr.includes("hero") || layoutStr.includes("3d") || data.needs3DModel) {
    rendererType = "hero3d";
  }

  // Visual Primitives mapping from foregroundElements if available
  let primitives = Array.isArray(data.visualPrimitives)
    ? data.visualPrimitives.map((vp: any, vIdx: number) => ({
        id: vp.id || `vp-${vIdx}`,
        type: vp.type || "box",
        label: vp.label ? String(vp.label) : undefined,
        detail: vp.detail ? String(vp.detail) : undefined,
        x: typeof vp.x === "number" ? vp.x : 0.3 + (vIdx % 3) * 0.3,
        y: typeof vp.y === "number" ? vp.y : 0.45,
        width: typeof vp.width === "number" ? vp.width : 0.2,
        height: typeof vp.height === "number" ? vp.height : 0.2,
        color: vp.color ? String(vp.color) : undefined,
        highlighted: Boolean(vp.highlighted),
        modelType: vp.modelType || data.modelType,
        metadata: vp.metadata || {},
      }))
    : [];

  if (primitives.length === 0 && Array.isArray(data.foregroundElements)) {
    primitives = data.foregroundElements.map((elem: string, eIdx: number) => ({
      id: `vp-${index}-${eIdx}`,
      type: eIdx === 0 ? "box" : "node",
      label: String(elem).slice(0, 26),
      detail: "Visual Element",
      x: 0.25 + (eIdx % 3) * 0.28,
      y: 0.45,
      width: 0.22,
      height: 0.18,
    }));
  }

  // Camera Motion mapping
  let cameraMotion = data.cameraMotion || data.cameraMovement || "static";
  if (cameraMotion === "slow-push-in") cameraMotion = "zoom-in";
  else if (cameraMotion === "zoom-out") cameraMotion = "zoom-out";
  else if (cameraMotion === "pan-left") cameraMotion = "pan-left";
  else if (cameraMotion === "pan-right") cameraMotion = "pan-right";
  else cameraMotion = "static";

  return {
    id: data.id || `scene-${Date.now()}-${index}`,
    sceneNumber: typeof data.sceneNumber === "number" ? data.sceneNumber : index + 1,
    title: String(data.title || `Scene ${index + 1}`),
    purpose: String(data.purpose || "Concept Overview"),
    narration: String(data.narration || ""),
    duration: typeof data.duration === "number" && data.duration > 0 ? data.duration : 10,
    rendererType,
    visualLanguage: {
      theme: String(data.visualLanguage?.theme || "dark"),
      primaryColor: String(data.visualLanguage?.primaryColor || "#6366F1"),
      secondaryColor: String(data.visualLanguage?.secondaryColor || "#8B5CF6"),
      accentColor: String(data.visualLanguage?.accentColor || "#38BDF8"),
    },
    visualPrimitives: primitives,
    animationBeats: Array.isArray(data.animationBeats)
      ? data.animationBeats.map((b: any, bIdx: number) => ({
          timestamp: typeof b.timestamp === "number" ? b.timestamp : typeof b.at === "number" ? b.at : 0,
          action: b.action || "enter",
          targetId: b.targetId || `target-${bIdx}`,
          description: b.description ? String(b.description) : undefined,
        }))
      : [],
    cameraMotion: cameraMotion as any,
    overlayElements: Array.isArray(data.overlayElements) ? data.overlayElements : [],
    customImageUrl: (typeof data.customImageUrl === "string" && (data.customImageUrl.startsWith("http") || data.customImageUrl.startsWith("data:"))) ? data.customImageUrl : undefined,
  };
}

export function validateVideoProject(data: any, fallbackPrompt: string): VideoProject {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response: Expected a valid VideoProject object.");
  }

  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    throw new Error("Invalid AI response: Project contains no scenes.");
  }

  const scenes = data.scenes.map((s: any, idx: number) => validateScenePlan(s, idx));

  return {
    id: data.id || `project-${Date.now()}`,
    prompt: String(data.prompt || fallbackPrompt),
    title: String(data.title || `Explainer: ${fallbackPrompt.slice(0, 30)}`),
    learningObjective: String(data.learningObjective || "Key Concept Breakdown"),
    audienceLevel: ["beginner", "intermediate", "advanced"].includes(data.audienceLevel)
      ? data.audienceLevel
      : "intermediate",
    scenes,
    aspectRatio: data.aspectRatio || "16:9",
    voiceover: data.voiceover || "nova",
    bgMusic: data.bgMusic || "none",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
