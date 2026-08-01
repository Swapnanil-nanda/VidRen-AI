// ============================================================
// Animation Variety & Sequence Enforcer Engine
// Prevents consecutive scenes from using identical canvas renderers.
// Rotates through 9 distinct visual animation modes (Hierarchy, PieChart, Process, Equation, Timeline, Architecture, Hero3D, Simulation, Comparison)
// ============================================================

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

    // Fix invalid piechart selection for Backpropagation / Neural Networks
    if (chosenRenderer === "piechart" && (lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule"))) {
      chosenRenderer = "architecture";
    }

    // Rule: NO TWO CONSECUTIVE SCENES ARE ALLOWED TO USE THE SAME ANIMATION TYPE
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
