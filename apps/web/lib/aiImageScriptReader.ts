
export function getAIImageUrl(prompt: string, seed: number = 42): string {
  const clean = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${clean}?width=1280&height=720&nologo=true&seed=${seed}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateScriptMatchedImageUrl(
  title: string,
  narration: string,
  sceneNumber: number,
  index: number = 0
): string {
  const cleanTitle = (title || "").trim();
  const cleanNarration = (narration || "").trim();
  const combined = (cleanTitle + " " + cleanNarration).toLowerCase();

  let visualSubject = cleanTitle;
  if (cleanNarration.length > 10) {
    
    const firstSentence = cleanNarration.split(".")[0];
    visualSubject = firstSentence.slice(0, 60);
  }

  let visualStyle = "photorealistic educational illustration, 8k quality, detailed cinematic lighting";

  if (
    combined.includes("french") ||
    combined.includes("revolution") ||
    combined.includes("bastille") ||
    combined.includes("louis") ||
    combined.includes("napoleon") ||
    combined.includes("monarchy") ||
    combined.includes("estate") ||
    combined.includes("history") ||
    combined.includes("oath")
  ) {
    visualStyle = "18th century historical oil painting, French Revolution 1789, historical Paris attire, no modern clothes, no Obama, no lab, no physics";
  } else if (
    combined.includes("health") ||
    combined.includes("who") ||
    combined.includes("nfhs") ||
    combined.includes("medical") ||
    combined.includes("mortality") ||
    combined.includes("disease")
  ) {
    visualStyle = "WHO medical research facility, National Family Health Survey visualization, healthcare clinic, medical science";
  } else if (
    combined.includes("quantum") ||
    combined.includes("entangle") ||
    combined.includes("superposition") ||
    combined.includes("qubit") ||
    combined.includes("physics")
  ) {
    visualStyle = "3D quantum physics wave-particle duality simulation, entangled photon pair, glowing quantum state vector, dark cyan aesthetic";
  } else if (combined.includes("dna") || combined.includes("bio") || combined.includes("gene") || combined.includes("cell")) {
    visualStyle = "3D photorealistic molecular biology render, DNA double helix strand, glowing enzymes";
  } else if (combined.includes("ai") || combined.includes("neural") || combined.includes("backprop") || combined.includes("gradient") || combined.includes("transformer")) {
    visualStyle = "futuristic AI neural network data graph, glowing self-attention nodes, dark tech aesthetic";
  }

  const aspectLabel = index === 0 ? "establishing wide view" : index === 1 ? "focused detailed view" : "dramatic angle";
  const prompt = `${visualStyle}, ${aspectLabel} depicting ${visualSubject}, 16:9 aspect ratio, no text, no watermark`;

  const seed = hashString(cleanNarration + cleanTitle) + sceneNumber * 1000 + index * 37;

  return getAIImageUrl(prompt, seed);
}
