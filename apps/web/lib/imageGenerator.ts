'use client';

import { verifyImageRelevance } from "./imageRelevanceVerifier";

const imageCache = new Map<string, HTMLImageElement>();

export function getAIImageUrl(prompt: string, seed: number = 42): string {
  const clean = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${clean}?width=1280&height=720&nologo=true&seed=${seed}`;
}

export function generateCinematicPrompt(title: string, purpose: string, aspect?: string, sceneNumber?: number): string {
  return `cinematic educational visual, ${aspect || 'wide shot'}, high contrast dark mode, ${title} ${purpose}`;
}

const FAILSAFE_TOPIC_PHOTOS: Record<string, string[]> = {
  french: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Prise_de_la_Bastille.jpg/1280px-Prise_de_la_Bastille.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Le_Serment_du_Jeu_de_paume.jpg/1280px-Le_Serment_du_Jeu_de_paume.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Declaration_of_the_Rights_of_Man_and_of_the_Citizen_in_1789.jpg/1024px-Declaration_of_the_Rights_of_Man_and_of_the_Citizen_in_1789.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Execution_louis_XVI_1793._louvre_dist_rnm_clich%C3%A9_jean-gilles_berizzi.jpg/1280px-Execution_louis_XVI_1793._louvre_dist_rnm_clich%C3%A9_jean-gilles_berizzi.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg/1280px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Anonymous_-_Prise_de_la_Bastille.jpg/1280px-Anonymous_-_Prise_de_la_Bastille.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Marat_by_David.jpg/1024px-Marat_by_David.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Robespierre.jpg/1024px-Robespierre.jpg",
  ],
  health: [
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1280&q=80",
  ],
  quantum: [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80",
  ],
  ai: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1280&q=80",
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1280&q=80",
  ]
};

export function getSceneImage(title: string, purpose: string, sceneNumber: number = 1, index: number = 0): HTMLImageElement | null {
  if (typeof window === "undefined") return null;

  const topicKey = title.toLowerCase().includes("french") || title.toLowerCase().includes("revolution") ? "french"
    : title.toLowerCase().includes("health") || title.toLowerCase().includes("medical") ? "health"
    : title.toLowerCase().includes("quantum") || title.toLowerCase().includes("physics") ? "quantum"
    : "ai";

  const list = FAILSAFE_TOPIC_PHOTOS[topicKey] || FAILSAFE_TOPIC_PHOTOS.ai;
  const rawUrl = list[(sceneNumber + index) % list.length];

  if (!verifyImageRelevance(rawUrl, title, topicKey)) {
    return null;
  }

  if (imageCache.has(rawUrl)) {
    return imageCache.get(rawUrl)!;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = rawUrl;
  img.onload = () => imageCache.set(rawUrl, img);
  return null;
}
