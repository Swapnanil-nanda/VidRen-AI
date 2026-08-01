import { ScenePlan, RenderConfig, BoardStyle } from "../types";
import { RENDERER_REGISTRY, RendererFunction } from "./sceneRenderers";
import { fillBoardBackground, renderStrokes } from "./canvasUtils";

export interface RenderedScene {
  canvas: HTMLCanvasElement;
  duration: number;
  narration: string;
}

export type FrameRenderer = (
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  duration: number
) => void;

export function createRenderCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Draws subtle floating ambient particle field for refined motion graphic backdrop */
function drawAmbientParticles(ctx: CanvasRenderingContext2D, width: number, height: number, time: number): void {
  ctx.save();
  const count = 40;
  for (let i = 0; i < count; i++) {
    const seed = i * 137.5;
    const px = ((Math.sin(seed + time * 0.2) * 0.5 + 0.5) * width);
    const py = ((Math.cos(seed * 1.5 + time * 0.15) * 0.5 + 0.5) * height);
    const radius = 1.5 + Math.sin(time + seed) * 1.0;
    const alpha = 0.15 + Math.sin(time * 2 + seed) * 0.10;

    ctx.fillStyle = `rgba(99, 102, 241, ${Math.max(0, alpha)})`;
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1, radius), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Draws radial vignette shadow around canvas edges */
function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.4,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.65)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function createFrameRenderer(scene: ScenePlan, config: RenderConfig & { boardStyle?: BoardStyle }): FrameRenderer {
  const narration = scene.narration || "";
  const words = narration.split(/\s+/).filter((w) => w.length > 0);
  const title = scene.title || `Scene ${scene.sceneNumber || 1}`;
  const sceneNumber = scene.sceneNumber || 1;
  const rendererType = scene.rendererType || "process";

  return (ctx: CanvasRenderingContext2D, timestamp: number, duration: number) => {
    const { width, height, style, boardStyle: configBoardStyle } = config;
    const progress = Math.min(Math.max(timestamp / duration, 0), 1);
    const activeBoardStyle: BoardStyle = configBoardStyle || scene.boardStyle || "blackboard";

    // 1. High-Contrast Refined Motion Graphic Background
    if (activeBoardStyle === "blackboard") {
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, width, height);

      // Glowing subtle grid lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.07)";
      ctx.lineWidth = 1;
      const gridGap = 60;
      for (let x = 0; x < width; x += gridGap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridGap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    } else if (activeBoardStyle === "greenboard") {
      ctx.fillStyle = "#0F281E";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridGap = 60;
      for (let x = 0; x < width; x += gridGap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridGap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    } else if (activeBoardStyle === "whiteboard") {
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
      ctx.lineWidth = 1;
      const gridGap = 60;
      for (let x = 0; x < width; x += gridGap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridGap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    } else {
      fillBoardBackground(ctx, width, height, activeBoardStyle);
    }

    // 2. Ambient Motion Graphic Particles & Vignette Glow
    if (activeBoardStyle === "blackboard") {
      drawAmbientParticles(ctx, width, height, timestamp);
      drawVignette(ctx, width, height);
    }

    ctx.globalAlpha = 1;

    // 3. Refined Header Scene Title & Progress Bar
    ctx.save();
    ctx.fillStyle = activeBoardStyle === "whiteboard" ? "#0F172A" : "#FFFFFF";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(title, width / 2, 34);

    // Sub-label (Purpose)
    if (scene.purpose) {
      ctx.fillStyle = activeBoardStyle === "whiteboard" ? "#475569" : "rgba(161, 161, 170, 0.85)";
      ctx.font = "13px sans-serif";
      ctx.fillText(scene.purpose.slice(0, 85), width / 2, 74);
    }

    // Progress Bar Indicator at top
    ctx.fillStyle = activeBoardStyle === "whiteboard" ? "rgba(2, 132, 199, 0.2)" : "rgba(99, 102, 241, 0.2)";
    ctx.fillRect(0, 0, width, 4);
    ctx.fillStyle = scene.visualLanguage?.primaryColor || "#6366F1";
    ctx.fillRect(0, 0, width * progress, 4);
    ctx.restore();

    // 4. Delegate Refined Animation Renderer (Process, Timeline, Comparison, Equation, Chart, 3D)
    const rendererFn: RendererFunction = RENDERER_REGISTRY[rendererType] || RENDERER_REGISTRY.process;
    rendererFn(ctx, scene, timestamp, duration, config);

    // 5. Freehand Overlay Elements
    if (scene.overlayElements && scene.overlayElements.length > 0) {
      const strokes = scene.overlayElements.filter((el) => el.kind === "stroke").map((el) => el as any);
      if (strokes.length > 0) renderStrokes(ctx, strokes);
    }

    // 6. Scene Indicator Badge (Bottom Left)
    ctx.save();
    ctx.fillStyle = activeBoardStyle === "whiteboard" ? "#0284C7" : "#6366F1";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`SCENE ${sceneNumber}`, 32, height - 32);
    ctx.restore();

    // 7. Glassmorphism Teleprompter Subtitle Box (Bottom Center)
    if (words.length > 0) {
      const totalWords = words.length;
      const visibleWordCount = Math.floor(progress * totalWords);
      const visibleText = words.slice(0, Math.max(1, visibleWordCount)).join(" ");
      ctx.save();
      ctx.fillStyle = activeBoardStyle === "whiteboard" ? "rgba(255, 255, 255, 0.92)" : "rgba(17, 17, 24, 0.88)";
      ctx.strokeStyle = activeBoardStyle === "whiteboard" ? "rgba(2, 132, 199, 0.3)" : "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 1.5;
      const boxWidth = width * 0.76;
      const boxHeight = 56;
      const boxX = (width - boxWidth) / 2;
      const boxY = height - 80;

      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
      } else {
        ctx.rect(boxX, boxY, boxWidth, boxHeight);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeBoardStyle === "whiteboard" ? "#0F172A" : "#F4F4F5";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const truncated = visibleText.length > 115 ? visibleText.slice(-115) + "..." : visibleText;
      ctx.fillText(truncated, width / 2, boxY + boxHeight / 2);
      ctx.restore();
    }
  };
}
