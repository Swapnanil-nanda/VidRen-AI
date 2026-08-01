// ============================================================
// ML / Keyword Verification & Feature Extraction Engine
// Automatically generates domain verification keywords & exclusion lists
// for validating all image inputs before merging into video generation.
// ============================================================

export interface ImageVerificationResult {
  isVerified: boolean;
  confidenceScore: number;
  matchedKeywords: string[];
  reason: string;
}

export interface TopicKeywordProfile {
  domain: "history" | "health" | "physics" | "biology" | "ai" | "general";
  requiredKeywords: string[];
  excludedKeywords: string[];
  conceptTags: string[];
}

/**
 * Dynamically generates keyword verification profiles from user input prompt & scene script.
 */
export function generateVerificationKeywords(prompt: string, title: string, narration: string): TopicKeywordProfile {
  const combinedText = `${prompt} ${title} ${narration}`.toLowerCase();

  // 1. History & French Revolution Profile
  if (
    combinedText.includes("french") ||
    combinedText.includes("revolution") ||
    combinedText.includes("bastille") ||
    combinedText.includes("napoleon") ||
    combinedText.includes("louis") ||
    combinedText.includes("monarchy") ||
    combinedText.includes("estate") ||
    combinedText.includes("history") ||
    combinedText.includes("terror") ||
    combinedText.includes("oath")
  ) {
    return {
      domain: "history",
      requiredKeywords: ["french", "revolution", "bastille", "napoleon", "louis", "monarchy", "estate", "history", "oath", "declaration", "1789", "painting", "museum", "wikimedia"],
      excludedKeywords: [
        "injection", "syringe", "needle", "vaccine", "medical",
        "coding", "code", "programming", "developer", "software", "circuit", "tech", "matrix",
        "wallpaper", "abstract", "desktop", "pattern",
        "conductor", "orchestra", "space", "moon", "hospital", "dna", "quantum"
      ],
      conceptTags: ["18th-century-art", "historical-painting", "bastille-storming", "french-republic"],
    };
  }

  // 2. Health & WHO / Medical Profile
  if (
    combinedText.includes("health") ||
    combinedText.includes("family") ||
    combinedText.includes("who") ||
    combinedText.includes("nfhs") ||
    combinedText.includes("medical") ||
    combinedText.includes("mortality") ||
    combinedText.includes("vaccine") ||
    combinedText.includes("stunting") ||
    combinedText.includes("disease")
  ) {
    return {
      domain: "health",
      requiredKeywords: ["health", "medical", "clinic", "who", "nfhs", "hospital", "doctor", "family", "healthcare", "research"],
      excludedKeywords: ["space", "moon", "conductor", "orchestra", "bastille", "napoleon", "quantum", "matrix"],
      conceptTags: ["who-indicators", "nfhs-survey", "clinical-healthcare", "medical-facility"],
    };
  }

  // 3. Quantum Physics Profile
  if (
    combinedText.includes("quantum") ||
    combinedText.includes("entangle") ||
    combinedText.includes("superposition") ||
    combinedText.includes("qubit") ||
    combinedText.includes("physics") ||
    combinedText.includes("wave")
  ) {
    return {
      domain: "physics",
      requiredKeywords: ["quantum", "physics", "superposition", "entanglement", "qubit", "wave", "state", "photon", "simulation"],
      excludedKeywords: ["bastille", "napoleon", "louis", "conductor", "hospital", "stunting"],
      conceptTags: ["quantum-state-vector", "wave-particle-duality", "entangled-photons"],
    };
  }

  // 4. Biology & DNA Profile
  if (
    combinedText.includes("dna") ||
    combinedText.includes("bio") ||
    combinedText.includes("gene") ||
    combinedText.includes("cell") ||
    combinedText.includes("repli")
  ) {
    return {
      domain: "biology",
      requiredKeywords: ["dna", "biology", "helix", "gene", "cell", "molecular", "enzyme", "base-pair", "laboratory"],
      excludedKeywords: ["bastille", "napoleon", "louis", "conductor", "space", "moon"],
      conceptTags: ["double-helix", "molecular-biology", "gene-replication"],
    };
  }

  // 5. AI & Computer Science Profile
  if (
    combinedText.includes("ai") ||
    combinedText.includes("neural") ||
    combinedText.includes("backprop") ||
    combinedText.includes("gradient") ||
    combinedText.includes("transformer") ||
    combinedText.includes("deep learning")
  ) {
    return {
      domain: "ai",
      requiredKeywords: ["ai", "neural", "network", "gradient", "transformer", "learning", "data", "graph", "nodes", "weights"],
      excludedKeywords: ["bastille", "napoleon", "louis", "conductor", "hospital", "stunting"],
      conceptTags: ["neural-architecture", "loss-gradient", "self-attention"],
    };
  }

  // General Fallback Profile
  return {
    domain: "general",
    requiredKeywords: ["educational", "diagram", "graphic", "illustration", "learning", "science"],
    excludedKeywords: ["conductor", "orchestra"],
    conceptTags: ["motion-graphics", "educational-visual"],
  };
}

/**
 * Image Input Verification Pipeline:
 * Validates an image URL against generated keyword profiles.
 * Returns verification status, confidence score, and matched tags.
 */
export function verifyImageInput(
  imageUrl: string | null,
  prompt: string,
  title: string,
  narration: string = ""
): ImageVerificationResult {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
    return {
      isVerified: false,
      confidenceScore: 0,
      matchedKeywords: [],
      reason: "Invalid or empty image URL string",
    };
  }

  const profile = generateVerificationKeywords(prompt, title, narration);
  const lowerUrl = imageUrl.toLowerCase();

  // 1. Check for Excluded / Blacklisted Keywords
  for (const excluded of profile.excludedKeywords) {
    if (lowerUrl.includes(excluded)) {
      return {
        isVerified: false,
        confidenceScore: 0,
        matchedKeywords: [],
        reason: `Image input contains excluded keyword '${excluded}' for domain ${profile.domain}`,
      };
    }
  }

  // 2. Calculate Confidence Score based on Required Keyword Matches
  const matched: string[] = [];
  for (const req of profile.requiredKeywords) {
    if (lowerUrl.includes(req)) {
      matched.push(req);
    }
  }

  // Always grant high confidence for verified direct CDN assets & Wikimedia Commons
  if (lowerUrl.includes("wikimedia.org") || lowerUrl.includes("unsplash.com") || lowerUrl.includes("pollinations.ai")) {
    matched.push("verified-cdn");
  }

  const confidenceScore = matched.length > 0 ? Math.min(1.0, 0.6 + matched.length * 0.2) : 0.8;

  return {
    isVerified: true,
    confidenceScore,
    matchedKeywords: matched,
    reason: `Verified under domain profile '${profile.domain}' with ${matched.length} keyword matches`,
  };
}
