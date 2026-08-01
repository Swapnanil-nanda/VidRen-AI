// ============================================================
// Canvas Drawing Utilities — Chalk Texture Rendering Engine
// ============================================================

import { Point, Stroke, BoardStyle, BOARD_CONFIGS } from "../types";

/**
 * Draw a chalk-textured freehand stroke on a 2D canvas context.
 * Uses jittered sub-points to simulate grainy chalk/dust texture.
 */
export function drawChalkStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number,
  opacity: number = 1
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Main stroke path
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();

  // Chalk grain texture overlay (small dots along the stroke)
  ctx.globalAlpha = opacity * 0.3;
  for (let i = 0; i < points.length; i += 2) {
    const p = points[i];
    const grainCount = Math.ceil(width / 3);
    for (let g = 0; g < grainCount; g++) {
      const offsetX = (Math.random() - 0.5) * width * 1.2;
      const offsetY = (Math.random() - 0.5) * width * 1.2;
      ctx.fillStyle = color;
      ctx.fillRect(p.x + offsetX, p.y + offsetY, 1, 1);
    }
  }

  ctx.restore();
}

/**
 * Draw a highlighter stroke (semi-transparent, wide)
 */
export function drawHighlighterStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  width: number
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = color;
  ctx.lineWidth = width * 3;
  ctx.lineCap = "square";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Erase by drawing with destination-out composite
 */
export function drawEraserStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  width: number
): void {
  if (points.length < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.lineWidth = width * 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw alignment grid on the background layer
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;

  for (let x = spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw ruled notebook lines
 */
export function drawRuledLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  const spacing = 32;

  for (let y = spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Left margin line
  ctx.strokeStyle = "rgba(255,100,100,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, height);
  ctx.stroke();

  ctx.restore();
}

/**
 * Render all strokes in a scene onto a canvas
 */
export function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[]
): void {
  for (const stroke of strokes) {
    switch (stroke.tool) {
      case "pen":
        drawChalkStroke(ctx, stroke.points, stroke.color, stroke.width, stroke.opacity);
        break;
      case "highlighter":
        drawHighlighterStroke(ctx, stroke.points, stroke.color, stroke.width);
        break;
      case "eraser":
        drawEraserStroke(ctx, stroke.points, stroke.width);
        break;
    }
  }
}

/**
 * Fill the background layer with the board style
 */
export function fillBoardBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  boardStyle: BoardStyle
): void {
  const config = BOARD_CONFIGS[boardStyle];
  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, width, height);

  // Add subtle vignette for blackboard/greenboard
  if (boardStyle !== "whiteboard") {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.2,
      width / 2, height / 2, height * 0.9
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Export canvas as a data URL
 */
export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg" = "png"
): string {
  return canvas.toDataURL(`image/${format}`);
}

/**
 * Generate a unique ID
 */
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
