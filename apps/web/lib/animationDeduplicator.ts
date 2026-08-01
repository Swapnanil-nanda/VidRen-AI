
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

    if (chosenRenderer === "piechart" && (lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule"))) {
      chosenRenderer = "architecture";
    }

    if (chosenRenderer === lastRenderer) {
      const candidates = ALL_RENDERERS.filter((r) => r !== lastRenderer);
      chosenRenderer = candidates[(idx + 3) % candidates.length];
    }
    lastRenderer = chosenRenderer;

    const cleanPrimitives: VisualPrimitive[] = (scene.visualPrimitives || []).map((prim, pIdx) => {
      let label = prim.label || `Node ${pIdx + 1}`;
      let detail = prim.detail || `Property ${pIdx + 1}`;

      if (seenPrimitiveLabels.has(label.toLowerCase())) {
        label = `${scene.title.slice(0, 18)} — ${label}`;
        detail = `Specific parameter ${idx + 1}.${pIdx + 1}`;
      }
      seenPrimitiveLabels.add(label.toLowerCase());

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
