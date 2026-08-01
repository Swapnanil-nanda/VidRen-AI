
import { ScenePlan, RendererType } from "../types";

const ALL_RENDERERS: RendererType[] = [
  "hero3d",
  "hierarchy",
  "architecture",
  "equation",
  "timeline",
  "comparison",
  "piechart",
  "process",
  "simulation",
  "chart",
];

export function enforceAnimationVariety(scenes: ScenePlan[], prompt: string): ScenePlan[] {
  const lower = prompt.toLowerCase();
  let lastRenderer: RendererType | null = null;

  return scenes.map((scene, idx) => {
    let chosenRenderer = scene.rendererType;

    if (chosenRenderer === "piechart" && (lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule"))) {
      chosenRenderer = "architecture";
    }

    if (chosenRenderer === lastRenderer) {
      const candidates = ALL_RENDERERS.filter((r) => r !== lastRenderer);
      chosenRenderer = candidates[idx % candidates.length];
    }

    lastRenderer = chosenRenderer;

    return {
      ...scene,
      rendererType: chosenRenderer,
    };
  });
}
