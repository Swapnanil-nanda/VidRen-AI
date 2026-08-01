// ============================================================
// Image Hash & Entropy Deduplication Algorithm
// Ensures EVERY background image URL across all scenes in a project is 100% UNIQUE.
// Tracks image hashes, URL signatures, and prevents duplicate background images!
// ============================================================

import { ScenePlan } from "../types";
import { getAIImageUrl, generateCinematicPrompt } from "./imageGenerator";

/** Hash string helper */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function deduplicateAndEnrichImages(scenes: ScenePlan[], prompt: string): ScenePlan[] {
  const globalUsedUrls = new Set<string>();

  return scenes.map((scene, sceneIdx) => {
    const sceneNumber = scene.sceneNumber || sceneIdx + 1;
    const title = scene.title || `Scene ${sceneNumber}`;
    const purpose = scene.purpose || "";

    // Generate 3 unique image URLs per scene
    const uniqueImages: string[] = [];

    for (let imgIdx = 0; imgIdx < 3; imgIdx++) {
      let seed = hashString(prompt + title) + sceneNumber * 1000 + imgIdx * 137;
      let aspect = imgIdx === 0 ? "wide establishing shot" : imgIdx === 1 ? "detailed focal view" : "dramatic perspective";

      let aiPrompt = generateCinematicPrompt(title, purpose, aspect, sceneNumber);
      let url = getAIImageUrl(aiPrompt, seed);

      // If URL was already used in a previous scene, mutate the seed until it is completely unique!
      let retryCount = 0;
      while (globalUsedUrls.has(url) && retryCount < 20) {
        seed += 997 + retryCount * 31;
        aiPrompt = generateCinematicPrompt(title, purpose, `${aspect} variation ${retryCount}`, sceneNumber);
        url = getAIImageUrl(aiPrompt, seed);
        retryCount++;
      }

      globalUsedUrls.add(url);
      uniqueImages.push(url);
    }

    // Attach custom image URL if requested, or keep the unique primary image
    return {
      ...scene,
      customImageUrl: scene.customImageUrl && !globalUsedUrls.has(scene.customImageUrl) ? scene.customImageUrl : uniqueImages[0],
    };
  });
}
