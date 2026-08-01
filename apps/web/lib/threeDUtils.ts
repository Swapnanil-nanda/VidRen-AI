// ============================================================
// 3D Visualizer & Projection Engine
// Renders real 3D animated objects on HTML5 Canvas
// ============================================================

import { Point } from "../types";

export type ThreeDModelType =
  | "bloch-sphere"
  | "dna-helix"
  | "neural-net"
  | "pendulum-3d"
  | "torus-geometry"
  | "solar-orbit";

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

// 3D Point Projection Helper (Perspective 3D to 2D)
function project3D(
  x: number,
  y: number,
  z: number,
  rotX: number,
  rotY: number,
  cx: number,
  cy: number,
  scale: number = 1
): { x: number; y: number; z: number } {
  // Rotate Y
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = x * cosY - z * sinY;
  const z1 = z * cosY + x * sinY;

  // Rotate X
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y1 = y * cosX - z1 * sinX;
  const z2 = z1 * cosX + y * sinX;

  // Perspective Projection
  const distance = 400;
  const fov = distance / (distance + z2);
  const px = cx + x1 * fov * scale;
  const py = cy + y1 * fov * scale;

  return { x: px, y: py, z: z2 };
}

/**
 * Render a 3D Bloch Sphere Qubit State Space
 */
export function draw3DBlochSphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotX: number,
  rotY: number,
  time: number,
  primaryColor: string = "#74C0FC",
  secondaryColor: string = "#FF8787"
): void {
  ctx.save();
  const radius = size * 0.4;

  // Outer Sphere Glow
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.3);
  glow.addColorStop(0, `${primaryColor}22`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Draw Latitude Circles
  const latSteps = 5;
  for (let i = 1; i < latSteps; i++) {
    const latAngle = (i / latSteps - 0.5) * Math.PI;
    const rLat = radius * Math.cos(latAngle);
    const zLat = radius * Math.sin(latAngle);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    for (let a = 0; a <= 360; a += 10) {
      const rad = (a * Math.PI) / 180;
      const x = rLat * Math.cos(rad);
      const y = rLat * Math.sin(rad);
      const p = project3D(x, y, zLat, rotX, rotY, cx, cy, 1);
      if (a === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // Draw Longitude Circles
  for (let a = 0; a < 180; a += 45) {
    const rad = (a * Math.PI) / 180;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    for (let b = 0; b <= 360; b += 10) {
      const bRad = (b * Math.PI) / 180;
      const x = radius * Math.cos(bRad) * Math.cos(rad);
      const y = radius * Math.sin(bRad);
      const z = radius * Math.cos(bRad) * Math.sin(rad);
      const p = project3D(x, y, z, rotX, rotY, cx, cy, 1);
      if (b === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // Draw Axes X, Y, Z
  const origin = project3D(0, 0, 0, rotX, rotY, cx, cy, 1);
  const xAxis = project3D(radius * 1.25, 0, 0, rotX, rotY, cx, cy, 1);
  const yAxis = project3D(0, radius * 1.25, 0, rotX, rotY, cx, cy, 1);
  const zAxis = project3D(0, 0, radius * 1.25, rotX, rotY, cx, cy, 1);

  // X Axis (Red)
  ctx.strokeStyle = "#FF8787";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(xAxis.x, xAxis.y);
  ctx.stroke();

  // Y Axis (Green)
  ctx.strokeStyle = "#63E6BE";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(yAxis.x, yAxis.y);
  ctx.stroke();

  // Z Axis (Blue)
  ctx.strokeStyle = "#74C0FC";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(zAxis.x, zAxis.y);
  ctx.stroke();

  // State Vector |ψ⟩ Animation
  const psiAngle = time * 0.002;
  const psiTheta = Math.PI * 0.35 + Math.sin(psiAngle) * 0.2;
  const psiPhi = psiAngle * 1.5;

  const qx = radius * Math.sin(psiTheta) * Math.cos(psiPhi);
  const qy = -radius * Math.cos(psiTheta);
  const qz = radius * Math.sin(psiTheta) * Math.sin(psiPhi);

  const qPt = project3D(qx, qy, qz, rotX, rotY, cx, cy, 1);

  // Draw Qubit Vector Arrow
  ctx.strokeStyle = "#FFE066";
  ctx.lineWidth = 35;
  ctx.shadowColor = "#FFE066";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(qPt.x, qPt.y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Qubit Tip Particle
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(qPt.x, qPt.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Label |ψ⟩
  ctx.fillStyle = "#FFE066";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("|ψ⟩ Qubit Vector", qPt.x + 8, qPt.y - 8);

  ctx.restore();
}

/**
 * Render a 3D Rotating DNA Double Helix
 */
export function draw3DDnaHelix(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotX: number,
  rotY: number,
  time: number,
  primaryColor: string = "#63E6BE",
  secondaryColor: string = "#E599F7"
): void {
  ctx.save();
  const height = size * 0.8;
  const radius = size * 0.25;
  const rungs = 16;

  for (let i = 0; i < rungs; i++) {
    const yVal = ((i / rungs) - 0.5) * height;
    const angle1 = (i * 0.4) + time * 0.003;
    const angle2 = angle1 + Math.PI;

    const x1 = radius * Math.cos(angle1);
    const z1 = radius * Math.sin(angle1);

    const x2 = radius * Math.cos(angle2);
    const z2 = radius * Math.sin(angle2);

    const p1 = project3D(x1, yVal, z1, rotX, rotY, cx, cy, 1);
    const p2 = project3D(x2, yVal, z2, rotX, rotY, cx, cy, 1);

    // Connecting Rung Line
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Nucleotide 1 Strand
    ctx.fillStyle = primaryColor;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Nucleotide 2 Strand
    ctx.fillStyle = secondaryColor;
    ctx.shadowColor = secondaryColor;
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Render a 3D Neural Network Graph Mesh
 */
export function draw3DNeuralNet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotX: number,
  rotY: number,
  time: number,
  primaryColor: string = "#74C0FC",
  secondaryColor: string = "#34D399"
): void {
  ctx.save();
  const radius = size * 0.35;
  const layers = [3, 4, 3];
  const nodes: { x: number; y: number; z: number; layer: number }[] = [];

  layers.forEach((count, layerIdx) => {
    const lx = ((layerIdx / (layers.length - 1)) - 0.5) * radius * 2.2;
    for (let i = 0; i < count; i++) {
      const ly = ((i / (count - 1 || 1)) - 0.5) * radius * 1.8;
      const lz = Math.sin(i * 1.5 + layerIdx) * 30;
      nodes.push({ x: lx, y: ly, z: lz, layer: layerIdx });
    }
  });

  // Project Nodes
  const projected = nodes.map((n) => ({
    ...project3D(n.x, n.y, n.z, rotX, rotY, cx, cy, 1),
    layer: n.layer,
  }));

  // Draw Edge Connections
  projected.forEach((n1, i) => {
    projected.forEach((n2, j) => {
      if (n2.layer === n1.layer + 1) {
        const pulse = (Math.sin(time * 0.005 + i + j) + 1) / 2;
        ctx.strokeStyle = `rgba(116, 192, 252, ${0.15 + pulse * 0.4})`;
        ctx.lineWidth = 1 + pulse * 1.5;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      }
    });
  });

  // Draw Node Particles
  projected.forEach((n, i) => {
    ctx.fillStyle = n.layer === 1 ? secondaryColor : primaryColor;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Render a 3D Spinning Torus Geometry
 */
export function draw3DTorus(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotX: number,
  rotY: number,
  time: number,
  primaryColor: string = "#E599F7"
): void {
  ctx.save();
  const R = size * 0.3;
  const r = size * 0.12;
  const segR = 12;
  const segr = 8;

  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 1;

  for (let i = 0; i < segR; i++) {
    const u = (i / segR) * Math.PI * 2;
    ctx.beginPath();
    for (let j = 0; j <= segr; j++) {
      const v = (j / segr) * Math.PI * 2;
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      const p = project3D(x, y, z, rotX, rotY, cx, cy, 1);
      if (j === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Dispatcher to render any 3D model type onto canvas
 */
export function render3DModel(
  ctx: CanvasRenderingContext2D,
  obj: ThreeDObjectElement,
  time: number
): void {
  const rotX = obj.rotationX + time * 0.0005 * obj.autoRotateSpeed;
  const rotY = obj.rotationY + time * 0.001 * obj.autoRotateSpeed;

  switch (obj.modelType) {
    case "bloch-sphere":
      draw3DBlochSphere(ctx, obj.x, obj.y, obj.size, rotX, rotY, time, obj.primaryColor, obj.secondaryColor);
      break;
    case "dna-helix":
      draw3DDnaHelix(ctx, obj.x, obj.y, obj.size, rotX, rotY, time, obj.primaryColor, obj.secondaryColor);
      break;
    case "neural-net":
      draw3DNeuralNet(ctx, obj.x, obj.y, obj.size, rotX, rotY, time, obj.primaryColor, obj.secondaryColor);
      break;
    case "torus-geometry":
    default:
      draw3DTorus(ctx, obj.x, obj.y, obj.size, rotX, rotY, time, obj.primaryColor);
      break;
  }
}
