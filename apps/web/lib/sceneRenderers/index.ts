import { ScenePlan, RenderConfig, ThreeDModelType } from "../../types";
import { render3DModel } from "../threeDUtils";

export type RendererFunction = (
  ctx: CanvasRenderingContext2D,
  scene: ScenePlan,
  timestamp: number,
  duration: number,
  config: RenderConfig
) => void;

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  const startY = y - (lines.length * lineHeight) / 2 + lineHeight / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

function elementVisibility(progress: number, index: number, total: number): number {
  const stagger = 0.6 / Math.max(total, 1);
  const start = index * stagger;
  const end = start + 0.25;
  if (progress < start) return 0;
  if (progress > end) return 1;
  return easeOut((progress - start) / (end - start));
}

function pulseAlpha(timestamp: number): number {
  return 0.6 + 0.4 * Math.sin(timestamp * 3);
}

export const renderProcessFlow: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const prims = (scene.visualPrimitives || []).filter((p) => p && (p.type === "node" || p.type === "box"));
  const nodes = prims.length > 0 ? prims : [
    { id: "n1", label: "Initial Phase", detail: scene.title.slice(0, 24), x: 0.25, y: 0.5 },
    { id: "n2", label: "Core Action", detail: (scene.purpose || scene.title).slice(0, 24), x: 0.5, y: 0.5 },
    { id: "n3", label: "Outcome State", detail: "Resolution & Impact", x: 0.75, y: 0.5 },
  ];

  const progress = Math.min(timestamp / duration, 1);
  const activeIndex = Math.floor(progress * nodes.length * 1.3);

  nodes.forEach((node, i) => {
    const vis = elementVisibility(progress, i, nodes.length);
    if (vis <= 0) return;

    const nx = (node.x ?? (i + 1) / (nodes.length + 1)) * width;
    const ny = (node.y ?? 0.5) * height;
    const isActive = i === Math.min(activeIndex, nodes.length - 1);
    const cardW = 190;
    const cardH = 85;

    const slideOffset = (1 - vis) * 40;
    const drawY = ny + slideOffset;

    ctx.save();
    ctx.globalAlpha = vis;

    if (i < nodes.length - 1) {
      const nextVis = elementVisibility(progress, i + 1, nodes.length);
      const nextNx = (nodes[i + 1].x ?? (i + 2) / (nodes.length + 1)) * width;
      const nextNy = (nodes[i + 1].y ?? 0.5) * height;

      ctx.strokeStyle = isActive ? scene.visualLanguage.primaryColor : "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -timestamp * 40;
      ctx.beginPath();
      ctx.moveTo(nx + cardW / 2, drawY);
      const endX = nx + cardW / 2 + (nextNx - cardW / 2 - (nx + cardW / 2)) * nextVis;
      const endY = drawY + (nextNy + (1 - nextVis) * 40 - drawY) * nextVis;
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const scale = 0.85 + 0.15 * vis;
    ctx.translate(nx, drawY);
    ctx.scale(scale, scale);
    ctx.translate(-nx, -drawY);

    ctx.fillStyle = isActive ? "rgba(17, 17, 24, 0.95)" : "rgba(15, 15, 18, 0.7)";
    ctx.strokeStyle = isActive ? scene.visualLanguage.primaryColor : "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = isActive ? 2.5 : 1;

    if (isActive) {
      ctx.shadowColor = scene.visualLanguage.primaryColor;
      ctx.shadowBlur = 12 * pulseAlpha(timestamp);
    }

    drawRoundRect(ctx, nx - cardW / 2, drawY - cardH / 2, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = isActive ? scene.visualLanguage.primaryColor : "rgba(255,255,255,0.25)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`STEP ${i + 1}`, nx - cardW / 2 + 14, drawY - cardH / 2 + 20);

    ctx.fillStyle = isActive ? "#FAFAFA" : "#A1A1AA";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText((node.label || `Phase ${i + 1}`).slice(0, 22), nx - cardW / 2 + 14, drawY - cardH / 2 + 40);

    if (node.detail) {
      ctx.fillStyle = "#71717A";
      ctx.font = "11px sans-serif";
      ctx.fillText(node.detail.slice(0, 28), nx - cardW / 2 + 14, drawY - cardH / 2 + 60);
    }

    ctx.restore();
  });
};

export const renderTimeline: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const cards = scene.visualPrimitives.length > 0 ? scene.visualPrimitives : [
    { id: "e1", label: "Origin Phase", detail: scene.title.slice(0, 24) },
    { id: "e2", label: "Core Event", detail: (scene.purpose || scene.title).slice(0, 24) },
    { id: "e3", label: "Aftermath & Legacy", detail: "Long-term Impact" },
  ];

  const progress = Math.min(timestamp / duration, 1);
  const axisY = height * 0.55;
  const startX = width * 0.1;
  const endX = width * 0.9;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, axisY);
  ctx.lineTo(endX, axisY);
  ctx.stroke();

  ctx.strokeStyle = scene.visualLanguage.accentColor || "#38BDF8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startX, axisY);
  ctx.lineTo(startX + (endX - startX) * easeOut(progress), axisY);
  ctx.stroke();

  cards.forEach((card, idx) => {
    const vis = elementVisibility(progress, idx, cards.length);
    if (vis <= 0) return;

    const cx = startX + ((idx + 1) / (cards.length + 1)) * (endX - startX);
    const cardY = idx % 2 === 0 ? axisY - 130 : axisY + 35;
    const isPassed = progress >= (idx + 1) / (cards.length + 1);
    const slideOffset = (1 - vis) * 30;

    ctx.save();
    ctx.globalAlpha = vis;

    ctx.strokeStyle = isPassed ? scene.visualLanguage.accentColor : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, axisY);
    ctx.lineTo(cx, cardY + (idx % 2 === 0 ? 75 : 0));
    ctx.stroke();

    ctx.fillStyle = isPassed ? scene.visualLanguage.accentColor : "#3F3F46";
    ctx.beginPath();
    ctx.arc(cx, axisY, isPassed ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();

    const cardW = 170;
    const cardH = 70;
    ctx.fillStyle = isPassed ? "rgba(17, 17, 24, 0.95)" : "rgba(15, 15, 18, 0.5)";
    ctx.strokeStyle = isPassed ? scene.visualLanguage.accentColor : "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, cx - cardW / 2, cardY + slideOffset, cardW, cardH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isPassed ? "#FAFAFA" : "#71717A";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText((card.label || `Event ${idx + 1}`).slice(0, 20), cx, cardY + slideOffset + 26);

    if (card.detail) {
      ctx.fillStyle = "#A1A1AA";
      ctx.font = "11px sans-serif";
      ctx.fillText(card.detail.slice(0, 30), cx, cardY + slideOffset + 48);
    }

    ctx.restore();
  });
  ctx.restore();
};

export const renderComparison: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const prims = (scene.visualPrimitives || []).filter((p) => p && (p.type === "box" || p.type === "node"));
  const leftItem = prims[0] || { label: "Primary Aspect", detail: scene.title };
  const rightItem = prims[1] || { label: "Target Impact", detail: scene.purpose || "Secondary Aspect" };

  const progress = Math.min(timestamp / duration, 1);
  const leftVis = easeOut(Math.min(progress * 2.5, 1));
  const rightVis = easeOut(Math.min((progress - 0.15) * 2.5, 1));

  const colW = width * 0.35;
  const colH = height * 0.45;
  const colY = height * 0.26;

  ctx.save();
  ctx.globalAlpha = leftVis;
  const leftX = width * 0.08 - (1 - leftVis) * 80;
  ctx.fillStyle = "rgba(17, 17, 24, 0.9)";
  ctx.strokeStyle = scene.visualLanguage.primaryColor || "#6366F1";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, leftX, colY, colW, colH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = scene.visualLanguage.primaryColor;
  ctx.font = "bold 17px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText((leftItem.label || "Primary Aspect").slice(0, 22), leftX + colW / 2, colY + 36);
  ctx.fillStyle = "#D4D4D8";
  ctx.font = "13px sans-serif";
  drawWrappedText(ctx, leftItem.detail || "", leftX + colW / 2, colY + colH / 2 + 10, colW - 40, 20);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = Math.max(rightVis, 0);
  const rightX = width * 0.57 + (1 - Math.max(rightVis, 0)) * 80;
  ctx.fillStyle = "rgba(17, 17, 24, 0.9)";
  ctx.strokeStyle = scene.visualLanguage.secondaryColor || "#8B5CF6";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, rightX, colY, colW, colH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = scene.visualLanguage.secondaryColor;
  ctx.font = "bold 17px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText((rightItem.label || "Target Impact").slice(0, 22), rightX + colW / 2, colY + 36);
  ctx.fillStyle = "#D4D4D8";
  ctx.font = "13px sans-serif";
  drawWrappedText(ctx, rightItem.detail || "", rightX + colW / 2, colY + colH / 2 + 10, colW - 40, 20);
  ctx.restore();

  const vsVis = easeOut(Math.min((progress - 0.3) * 4, 1));
  if (vsVis > 0) {
    ctx.save();
    ctx.globalAlpha = vsVis;
    ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
    ctx.beginPath();
    ctx.arc(width / 2, colY + colH / 2, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#A5B4FC";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VS", width / 2, colY + colH / 2);
    ctx.restore();
  }
};

export const renderHierarchy: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const progress = Math.min(timestamp / duration, 1);
  const lower = (scene.title + " " + (scene.purpose || "")).toLowerCase();

  let parentTitle = scene.title.slice(0, 32);
  let children: { label: string; detail: string; val?: string }[] = [
    { label: "Pillar A", detail: "Primary structural branch" },
    { label: "Pillar B", detail: "Core operational mechanism" },
    { label: "Pillar C", detail: "Target outcome & result" },
  ];

  if (lower.includes("french") || lower.includes("estates") || lower.includes("revolution")) {
    parentTitle = "Estates-General (1789 Hierarchy)";
    children = [
      { label: "First Estate", detail: "Clergy (1% pop)", val: "1 Vote" },
      { label: "Second Estate", detail: "Nobility (2% pop)", val: "1 Vote" },
      { label: "Third Estate", detail: "Commoners (97% pop)", val: "1 Vote" },
    ];
  } else if (lower.includes("dna") || lower.includes("repli")) {
    parentTitle = "DNA Replication Machinery";
    children = [
      { label: "Helicase", detail: "Unwinds double helix" },
      { label: "DNA Polymerase III", detail: "5' to 3' elongation" },
      { label: "DNA Ligase", detail: "Seals Okazaki fragments" },
    ];
  }

  const parentVis = easeOut(Math.min(progress * 2.5, 1));
  const parentW = 320;
  const parentH = 65;
  const parentX = (width - parentW) / 2;
  const parentY = height * 0.22;

  ctx.save();
  ctx.globalAlpha = parentVis;
  ctx.fillStyle = "rgba(17, 17, 24, 0.95)";
  ctx.strokeStyle = scene.visualLanguage.primaryColor || "#6366F1";
  ctx.lineWidth = 2.5;
  drawRoundRect(ctx, parentX, parentY, parentW, parentH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(parentTitle, width / 2, parentY + 38);
  ctx.restore();

  const childW = 190;
  const childH = 75;
  const startX = width * 0.12;
  const endX = width * 0.88;
  const childY = height * 0.55;

  children.forEach((child, idx) => {
    const vis = elementVisibility(progress, idx, children.length);
    if (vis <= 0) return;

    const cx = startX + ((idx + 0.5) / children.length) * (endX - startX);
    ctx.save();
    ctx.globalAlpha = vis;

    ctx.strokeStyle = scene.visualLanguage.primaryColor + "80";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -timestamp * 30;
    ctx.beginPath();
    ctx.moveTo(width / 2, parentY + parentH);
    ctx.lineTo(cx, childY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(15, 15, 20, 0.95)";
    ctx.strokeStyle = idx === 2 ? "#38BDF8" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, cx - childW / 2, childY, childW, childH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = idx === 2 ? "#38BDF8" : "#FAFAFA";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(child.label, cx, childY + 28);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "11px sans-serif";
    ctx.fillText(child.detail, cx, childY + 50);

    if (child.val) {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 10px monospace";
      ctx.fillText(child.val, cx, childY + 65);
    }

    ctx.restore();
  });
};

export const renderPieChart: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const progress = Math.min(timestamp / duration, 1);
  const lower = (scene.title + " " + (scene.purpose || "")).toLowerCase();

  let slices = [
    { label: "Third Estate (Commoners)", pct: 0.97, color: "#6366F1" },
    { label: "Nobility", pct: 0.02, color: "#F59E0B" },
    { label: "Clergy", pct: 0.01, color: "#10B981" },
  ];
  let centerText = "Proportions";

  if (lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule") || lower.includes("loss")) {
    slices = [
      { label: "Weight Gradients (∂L/∂W)", pct: 0.65, color: "#6366F1" },
      { label: "Bias Gradients (∂L/∂b)", pct: 0.25, color: "#38BDF8" },
      { label: "Activation Delta (∂L/∂a)", pct: 0.10, color: "#F59E0B" },
    ];
    centerText = "Gradients";
  } else if (lower.includes("dna")) {
    slices = [
      { label: "Adenine-Thymine Pairs", pct: 0.60, color: "#38BDF8" },
      { label: "Guanine-Cytosine Pairs", pct: 0.40, color: "#8B5CF6" },
    ];
    centerText = "Base Ratio";
  }

  const cx = width * 0.38;
  const cy = height * 0.48;
  const radius = Math.min(width, height) * 0.22;

  ctx.save();

  let currentAngle = -Math.PI / 2;
  const revealPct = easeOut(progress);

  slices.forEach((slice, idx) => {
    const sliceAngle = slice.pct * Math.PI * 2 * revealPct;
    const endAngle = currentAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, currentAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = slice.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(17, 17, 24, 0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();

    currentAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#09090B";
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(centerText, cx, cy);

  const legendX = width * 0.62;
  slices.forEach((slice, idx) => {
    const vis = elementVisibility(progress, idx, slices.length);
    if (vis <= 0) return;

    const ly = height * 0.3 + idx * 55;
    ctx.save();
    ctx.globalAlpha = vis;

    ctx.fillStyle = "rgba(17, 17, 24, 0.9)";
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, legendX, ly, 230, 45, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = slice.color;
    ctx.fillRect(legendX + 12, ly + 14, 16, 16);

    ctx.fillStyle = "#FAFAFA";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(slice.label.slice(0, 24), legendX + 36, ly + 28);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`${Math.round(slice.pct * 100)}%`, legendX + 185, ly + 28);

    ctx.restore();
  });

  ctx.restore();
};

export const renderEquation: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const lower = (scene.title + " " + (scene.purpose || "")).toLowerCase();
  const sceneNum = scene.sceneNumber || 1;

  let formula = scene.visualPrimitives.find((p) => p.type === "equation")?.label;
  if (!formula) {
    if (lower.includes("backprop") || lower.includes("neural") || lower.includes("gradient") || lower.includes("chain rule") || lower.includes("loss")) {
      const backpropFormulas = [
        "z = W · x + b,  a = σ(z)",
        "L(y, a) = - [y log(a) + (1-y) log(1-a)]",
        "∂L/∂W = (∂L/∂a) · (∂a/∂z) · (∂z/∂W)",
        "W ← W - η · (∂L/∂W)",
        "m_t = β₁ m_{t-1} + (1 - β₁) g_t",
      ];
      formula = backpropFormulas[(sceneNum - 1) % backpropFormulas.length];
    } else if (lower.includes("quantum") || lower.includes("entangle") || lower.includes("qubit") || lower.includes("physics")) {
      const quantumFormulas = [
        "iℏ (∂/∂t)|Ψ⟩ = Ĥ|Ψ⟩",
        "|Ψ⁺⟩ = (1/√2)(|00⟩ + |11⟩)",
        "|E(a,b) - E(a,b') + E(a',b) + E(a',b')| ≤ 2",
        "|ψ⟩ = cos(θ/2)|0⟩ + e^{iϕ} sin(θ/2)|1⟩",
      ];
      formula = quantumFormulas[(sceneNum - 1) % quantumFormulas.length];
    } else if (lower.includes("health") || lower.includes("family") || lower.includes("who") || lower.includes("nfhs") || lower.includes("medical")) {
      const healthFormulas = [
        "IMR = (Infant Deaths / Live Births) × 1,000",
        "HAZ = (Height - Median_Ref) / SD_Ref",
        "Full Coverage = (DPT3 + Measles) / Target",
        "MMR = (Maternal Deaths / 100,000 Live Births)",
      ];
      formula = healthFormulas[(sceneNum - 1) % healthFormulas.length];
    } else if (lower.includes("revolution") || lower.includes("french") || lower.includes("rights") || lower.includes("declaration")) {
      const historyFormulas = [
        "Liberté, Égalité, Fraternité",
        "Serment du Jeu de Paume (20 Juin 1789)",
        "Déclaration des Droits de l'Homme (1789)",
        "République Française (22 Septembre 1792)",
      ];
      formula = historyFormulas[(sceneNum - 1) % historyFormulas.length];
    } else {
      formula = `${scene.title.slice(0, 32)}`;
    }
  }

  const progress = Math.min(timestamp / duration, 1);
  const boxVis = easeOut(Math.min(progress * 3, 1));
  const boxW = width * 0.65;
  const boxH = 120;
  const boxY = height * 0.34;

  ctx.save();
  ctx.globalAlpha = boxVis;
  const scale = 0.9 + 0.1 * boxVis;
  ctx.translate(width / 2, boxY + boxH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -(boxY + boxH / 2));

  ctx.fillStyle = "rgba(17, 17, 24, 0.92)";
  ctx.strokeStyle = scene.visualLanguage.primaryColor || "#6366F1";
  ctx.lineWidth = 2;
  drawRoundRect(ctx, (width - boxW) / 2, boxY, boxW, boxH, 16);
  ctx.fill();
  ctx.stroke();

  const visChars = Math.floor(easeOut(Math.min((progress - 0.1) * 2, 1)) * formula.length);
  const displayFormula = formula.slice(0, Math.max(1, visChars));

  ctx.fillStyle = scene.visualLanguage.primaryColor;
  ctx.font = formula.length > 28 ? "bold 24px sans-serif" : "bold 34px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(displayFormula, width / 2, boxY + boxH / 2);

  if (visChars < formula.length && Math.floor(timestamp * 3) % 2 === 0) {
    const cursorX = width / 2 + ctx.measureText(displayFormula).width / 2 + 4;
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(cursorX, boxY + boxH / 2 - 18, 3, 36);
  }

  ctx.restore();
};

export const renderChart: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const progress = Math.min(timestamp / duration, 1);
  const lower = (scene.title + " " + (scene.purpose || "")).toLowerCase();

  let datasetHeader = "Official Organization Dataset";
  let bars = [
    { label: "Phase A", val: 0.45, displayVal: "45%" },
    { label: "Phase B", val: 0.72, displayVal: "72%" },
    { label: "Phase C", val: 0.88, displayVal: "88%" },
    { label: "Phase D", val: 0.65, displayVal: "65%" },
  ];

  if (
    lower.includes("health") ||
    lower.includes("family") ||
    lower.includes("who") ||
    lower.includes("nfhs") ||
    lower.includes("medical") ||
    lower.includes("mortality") ||
    lower.includes("vaccine") ||
    lower.includes("stunting") ||
    lower.includes("birth") ||
    lower.includes("disease")
  ) {
    datasetHeader = "WHO & NFHS-5/6 Official Health Indicators";
    bars = [
      { label: "Institutional Births", val: 0.886, displayVal: "88.6%" },
      { label: "Full Immunization", val: 0.764, displayVal: "76.4%" },
      { label: "Under-5 Stunting", val: 0.355, displayVal: "35.5%" },
      { label: "Maternal Care", val: 0.682, displayVal: "68.2%" },
      { label: "Life Expectancy", val: 0.734, displayVal: "73.4y" },
    ];
  } else if (
    lower.includes("french") ||
    lower.includes("revolution") ||
    lower.includes("bastille") ||
    lower.includes("history") ||
    lower.includes("tax") ||
    lower.includes("estate") ||
    lower.includes("monarchy")
  ) {
    datasetHeader = "1789 French Revolutionary Tax & Population Census";
    bars = [
      { label: "Third Estate Pop.", val: 0.978, displayVal: "97.8%" },
      { label: "Third Estate Tax", val: 0.999, displayVal: "100%" },
      { label: "Nobility Tax", val: 0.001, displayVal: "0%" },
      { label: "Clergy Land", val: 0.15, displayVal: "15%" },
    ];
  } else if (
    lower.includes("quantum") ||
    lower.includes("dna") ||
    lower.includes("ai") ||
    lower.includes("backprop") ||
    lower.includes("neural") ||
    lower.includes("cern") ||
    lower.includes("physics") ||
    lower.includes("genome")
  ) {
    datasetHeader = "CERN LHC & Human Genome Empirical Dataset";
    bars = [
      { label: "Replication Fidelity", val: 0.9999, displayVal: "99.99%" },
      { label: "Validation Acc.", val: 0.984, displayVal: "98.4%" },
      { label: "LHC Collision", val: 0.65, displayVal: "13 TeV" },
      { label: "Bell Violation", val: 0.82, displayVal: "2.82 S" },
    ];
  }

  const chartW = width * 0.65;
  const chartH = height * 0.38;
  const startX = (width - chartW) / 2;
  const startY = height * 0.32;

  ctx.save();

  ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
  ctx.strokeStyle = scene.visualLanguage.primaryColor || "#6366F1";
  ctx.lineWidth = 1;
  drawRoundRect(ctx, startX, startY - 44, chartW, 32, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = scene.visualLanguage.primaryColor || "#38BDF8";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`DATASET: ${datasetHeader.toUpperCase()}`, width / 2, startY - 24);

  bars.forEach((b, idx) => {
    const vis = elementVisibility(progress, idx, bars.length);
    if (vis <= 0) return;

    const bw = Math.min(65, chartW / bars.length - 20);
    const gap = (chartW - bars.length * bw) / (bars.length + 1);
    const bx = startX + gap + idx * (bw + gap);
    const targetH = chartH * b.val;
    const bh = targetH * easeOut(vis);

    ctx.globalAlpha = vis;
    ctx.fillStyle = idx % 2 === 0 ? (scene.visualLanguage.primaryColor || "#6366F1") : (scene.visualLanguage.accentColor || "#38BDF8");
    ctx.fillRect(bx, startY + chartH - bh, bw, bh);

    ctx.fillStyle = "#FAFAFA";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(b.displayVal, bx + bw / 2, startY + chartH - bh - 8);

    ctx.fillStyle = "#A1A1AA";
    ctx.font = "11px sans-serif";
    ctx.fillText(b.label.slice(0, 16), bx + bw / 2, startY + chartH + 20);
  });

  ctx.restore();
};

export const renderSimulation: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const progress = Math.min(timestamp / duration, 1);

  ctx.save();
  const drawWidth = width * 0.7 * easeOut(Math.min(progress * 1.5, 1));
  const offsetX = width * 0.15;

  ctx.strokeStyle = scene.visualLanguage.primaryColor || "#38BDF8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  const points = 120;
  for (let i = 0; i <= points; i++) {
    const px = offsetX + (i / points) * drawWidth;
    const py = height * 0.45 + Math.sin(i * 0.12 + timestamp * 4) * 50 * easeOut(Math.min(progress * 2, 1));
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.strokeStyle = (scene.visualLanguage.secondaryColor || "#8B5CF6") + "80";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const px = offsetX + (i / points) * drawWidth;
    const py = height * 0.45 + Math.cos(i * 0.08 + timestamp * 3) * 35 * easeOut(Math.min(progress * 2, 1));
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  const dotPos = (timestamp * 60) % (points);
  const dotX = offsetX + (dotPos / points) * drawWidth;
  const dotY = height * 0.45 + Math.sin(dotPos * 0.12 + timestamp * 4) * 50 * easeOut(Math.min(progress * 2, 1));
  ctx.fillStyle = scene.visualLanguage.accentColor || "#38BDF8";
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const renderHero3D: RendererFunction = (ctx, scene, timestamp, duration, config) => {
  const { width, height } = config;
  const lower = (scene.title + " " + (scene.purpose || "")).toLowerCase();
  let modelType: ThreeDModelType =
    (scene.visualPrimitives.find((p) => p.type === "3d-model")?.modelType as ThreeDModelType) ||
    (lower.includes("dna") ? "dna-helix" : lower.includes("quantum") ? "bloch-sphere" : lower.includes("neural") || lower.includes("ai") ? "neural-net" : "solar-orbit");

  const progress = Math.min(timestamp / duration, 1);
  const modelVis = easeOut(Math.min(progress * 2.5, 1));

  ctx.save();
  ctx.globalAlpha = modelVis;

  const modelElement = {
    id: `hero-${scene.sceneNumber}`,
    modelType,
    x: width / 2,
    y: height * 0.44,
    size: Math.min(width, height) * 0.32 * (0.9 + 0.1 * modelVis),
    rotationX: Math.PI / 7,
    rotationY: timestamp * 0.6,
    rotationZ: 0,
    autoRotateSpeed: 1,
    primaryColor: scene.visualLanguage.primaryColor || "#6366F1",
    secondaryColor: scene.visualLanguage.secondaryColor || "#8B5CF6",
  };

  render3DModel(ctx, modelElement, timestamp * 1000);

  const labels = (scene.visualPrimitives || []).filter((p) => p && p.type !== "3d-model");
  labels.forEach((lbl, idx) => {
    const lblVis = elementVisibility(progress, idx, labels.length);
    if (lblVis <= 0) return;

    const isLeft = idx % 2 === 0;
    const row = Math.floor(idx / 2);
    const lx = isLeft ? width * 0.18 : width * 0.82;
    const ly = height * 0.32 + row * 65;

    ctx.globalAlpha = lblVis;
    ctx.fillStyle = "rgba(17, 17, 24, 0.90)";
    ctx.strokeStyle = scene.visualLanguage.primaryColor || "#6366F1";
    ctx.lineWidth = 1.5;
    drawRoundRect(ctx, lx - 80, ly - 20, 160, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#FAFAFA";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((lbl.label || "").slice(0, 20), lx, ly);
  });

  ctx.restore();
};

export const RENDERER_REGISTRY: Record<string, RendererFunction> = {
  process: renderProcessFlow,
  timeline: renderTimeline,
  comparison: renderComparison,
  architecture: renderHierarchy,
  hierarchy: renderHierarchy,
  piechart: renderPieChart,
  equation: renderEquation,
  chart: renderChart,
  simulation: renderSimulation,
  hero3d: renderHero3D,
};
