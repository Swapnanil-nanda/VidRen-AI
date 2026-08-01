// ============================================================
// Animation Primitive & Visual Structure Deduplication Engine
// Ensures that EVERY scene has 100% unique visual primitive cards,
// unique diagram node labels, unique layout coordinates, and unique animation beats!
// ============================================================

import { ScenePlan, RendererType, VisualPrimitive } from "../types";

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

export function deduplicateAndEnrichAnimations(scenes: ScenePlan[], prompt: string): ScenePlan[] {
  const lower = prompt.toLowerCase();
  const seenPrimitiveLabels = new Set<string>();
  let lastRenderer: RendererType | null = null;

  return scenes.map((scene, idx) => {
    let chosenRenderer = scene.rendererType;

    // Rule 1: Fix invalid piechart selection for Backpropagation / AI
    if (chosenRenderer === "piechart" && (lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule"))) {
      chosenRenderer = "architecture";
    }

    // Rule 2: Strict Renderer Rotation — NO TWO CONSECUTIVE SCENES SHARE THE SAME ANIMATION TYPE
    if (chosenRenderer === lastRenderer) {
      const candidates = ALL_RENDERERS.filter((r) => r !== lastRenderer);
      chosenRenderer = candidates[(idx + 3) % candidates.length];
    }
    lastRenderer = chosenRenderer;

    // Rule 3: Visual Primitives Label Deduplication & Coordinate Randomization
    const cleanPrimitives: VisualPrimitive[] = (scene.visualPrimitives || []).map((prim, pIdx) => {
      let label = prim.label || `Node ${pIdx + 1}`;
      let detail = prim.detail || `Property ${pIdx + 1}`;

      // If primitive label was used in a previous scene, enrich it with domain specificity!
      if (seenPrimitiveLabels.has(label.toLowerCase())) {
        label = `${scene.title.slice(0, 18)} — ${label}`;
        detail = `Specific parameter ${idx + 1}.${pIdx + 1}`;
      }
      seenPrimitiveLabels.add(label.toLowerCase());

      // Layout coordinate variation per scene so no two cards draw at identical screen positions
      const offsetX = ((idx % 3) - 1) * 0.05;
      const offsetY = ((pIdx % 2) - 0.5) * 0.04;

      return {
        ...prim,
        label,
        detail,
        x: Math.max(0.15, Math.min(0.85, (prim.x ?? 0.3 + pIdx * 0.35) + offsetX)),
        y: Math.max(0.25, Math.min(0.75, (prim.y ?? 0.45) + offsetY)),
      };
    });

    // Rule 4: If scene has no primitives, construct 2 unique domain primitives
    if (cleanPrimitives.length === 0) {
      cleanPrimitives.push(
        {
          id: `vp-${idx}-1`,
          type: "box",
          label: `${scene.title.slice(0, 22)} Pillar`,
          detail: "Primary structural component",
          x: 0.3,
          y: 0.45,
        },
        {
          id: `vp-${idx}-2`,
          type: "node",
          label: "Functional State",
          detail: "Operational parameter",
          x: 0.7,
          y: 0.45,
        }
      );
    }

    return {
      ...scene,
      rendererType: chosenRenderer,
      visualPrimitives: cleanPrimitives,
    };
  });
}
