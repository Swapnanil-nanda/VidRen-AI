
import { VoiceOption } from "../types";

export interface AvatarPersona {
  id: string;
  name: string;
  role: string;
  skinColor: string;
  hairColor: string;
  clothingColor: string;
  accentColor: string;
  gender: "female" | "male" | "cyber";
}

export const AVATAR_PERSONAS: Record<string, AvatarPersona> = {
  nova: {
    id: "nova",
    name: "Dr. Nova",
    role: "Lead Educator",
    skinColor: "#F5D0C5",
    hairColor: "#2A1B16",
    clothingColor: "#4F46E5",
    accentColor: "#38BDF8",
    gender: "female",
  },
  alloy: {
    id: "alloy",
    name: "Prof. Alloy",
    role: "Senior Historian",
    skinColor: "#E0B39A",
    hairColor: "#4A4A4A",
    clothingColor: "#1E293B",
    accentColor: "#6366F1",
    gender: "male",
  },
  fable: {
    id: "fable",
    name: "Dr. Fable",
    role: "Science Researcher",
    skinColor: "#F7D8C4",
    hairColor: "#8B4513",
    clothingColor: "#059669",
    accentColor: "#34D399",
    gender: "female",
  },
  echo: {
    id: "echo",
    name: "Echo Cyber",
    role: "AI Director",
    skinColor: "#D1D5DB",
    hairColor: "#38BDF8",
    clothingColor: "#0F172A",
    accentColor: "#A855F7",
    gender: "cyber",
  },
};

function calculateLipSyncOpening(progress: number, words: string[], timestamp: number): number {
  if (words.length === 0 || progress <= 0 || progress >= 0.98) return 0.05;

  const currentWordIndex = Math.floor(progress * words.length);
  const currentWord = words[currentWordIndex] || "";

  const lowerWord = currentWord.toLowerCase();
  const hasOpenVowels = /[aeiou]/.test(lowerWord);

  const osc = Math.sin(timestamp * 18);
  const baseOpen = hasOpenVowels ? 0.65 : 0.35;

  return Math.max(0.08, Math.min(0.95, baseOpen + osc * 0.3));
}

export function renderTalkingAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  voiceOption: VoiceOption = "nova",
  progress: number = 0,
  words: string[] = [],
  timestamp: number = 0
): void {
  ctx.save();

  const persona = AVATAR_PERSONAS[voiceOption] || AVATAR_PERSONAS.nova;
  const radius = size / 2;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;

  const cardW = size * 1.35;
  const cardH = size * 1.45;
  const cardX = x - cardW / 2;
  const cardY = y - cardH / 2;

  ctx.fillStyle = "rgba(17, 17, 24, 0.92)";
  ctx.strokeStyle = persona.accentColor + "80";
  ctx.lineWidth = 2;

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const glowGrad = ctx.createRadialGradient(x, y - 10, radius * 0.6, x, y - 10, radius * 1.15);
  glowGrad.addColorStop(0, persona.accentColor + "33");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(x, y - 10, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y - 10, radius * 0.9, 0, Math.PI * 2);
  ctx.clip();

  const wallGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  wallGrad.addColorStop(0, "#1E1E2E");
  wallGrad.addColorStop(1, "#0F0F1A");
  ctx.fillStyle = wallGrad;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

  const headSwayX = Math.sin(timestamp * 1.8) * 2;
  const headSwayY = Math.cos(timestamp * 2.2) * 1.5;
  const hx = x + headSwayX;
  const hy = y - 15 + headSwayY;

  ctx.fillStyle = persona.clothingColor;
  ctx.beginPath();
  ctx.ellipse(hx, hy + radius * 0.8, radius * 0.85, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = persona.accentColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(hx - 12, hy + radius * 0.4);
  ctx.lineTo(hx, hy + radius * 0.65);
  ctx.lineTo(hx + 12, hy + radius * 0.4);
  ctx.stroke();

  ctx.fillStyle = persona.skinColor;
  ctx.fillRect(hx - 10, hy + 12, 20, 20);

  ctx.beginPath();
  ctx.ellipse(hx, hy, radius * 0.42, radius * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = persona.hairColor;
  if (persona.gender === "female") {
    
    ctx.beginPath();
    ctx.arc(hx, hy - 14, radius * 0.46, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(hx - radius * 0.46, hy - 14, radius * 0.92, 24);
  } else if (persona.gender === "male") {
    
    ctx.beginPath();
    ctx.arc(hx, hy - 10, radius * 0.45, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
  } else {
    
    ctx.fillStyle = persona.hairColor;
    ctx.beginPath();
    ctx.arc(hx, hy - 10, radius * 0.44, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  const blinkCycle = (timestamp * 0.5) % 4; 
  const isBlinking = blinkCycle > 3.8;

  ctx.fillStyle = "#1E293B";
  const eyeOffsetY = -4;
  const eyeOffsetX = 11;

  if (isBlinking) {
    
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx - eyeOffsetX - 5, hy + eyeOffsetY);
    ctx.lineTo(hx - eyeOffsetX + 5, hy + eyeOffsetY);
    ctx.moveTo(hx + eyeOffsetX - 5, hy + eyeOffsetY);
    ctx.lineTo(hx + eyeOffsetX + 5, hy + eyeOffsetY);
    ctx.stroke();
  } else {
    
    ctx.beginPath();
    ctx.arc(hx - eyeOffsetX, hy + eyeOffsetY, 3.5, 0, Math.PI * 2);
    ctx.arc(hx + eyeOffsetX, hy + eyeOffsetY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(hx - eyeOffsetX - 1, hy + eyeOffsetY - 1, 1.2, 0, Math.PI * 2);
    ctx.arc(hx + eyeOffsetX - 1, hy + eyeOffsetY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = persona.hairColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hx - eyeOffsetX - 6, hy + eyeOffsetY - 6);
  ctx.lineTo(hx - eyeOffsetX + 4, hy + eyeOffsetY - 7);
  ctx.moveTo(hx + eyeOffsetX - 4, hy + eyeOffsetY - 7);
  ctx.lineTo(hx + eyeOffsetX + 6, hy + eyeOffsetY - 6);
  ctx.stroke();

  const mouthOpen = calculateLipSyncOpening(progress, words, timestamp);
  const mouthY = hy + 14;
  const mouthWidth = 14;
  const mouthHeight = Math.max(2, mouthOpen * 14);

  ctx.save();
  ctx.fillStyle = "#991B1B"; 
  ctx.beginPath();
  ctx.ellipse(hx, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (mouthHeight > 4) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(hx - 4, mouthY - mouthHeight / 2, 8, 2.5);
  }

  ctx.strokeStyle = "#B91C1C";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(hx, mouthY, mouthWidth / 2, mouthHeight / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); 

  ctx.fillStyle = persona.accentColor;
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(persona.name.toUpperCase(), x, y + cardH / 2 - 20);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "9px monospace";
  ctx.fillText("AI PRESENTING", x, y + cardH / 2 - 8);

  ctx.restore();
}
