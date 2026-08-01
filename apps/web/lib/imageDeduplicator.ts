
import { ScenePlan } from "../types";
import { getAIImageUrl, generateCinematicPrompt } from "./imageGenerator";

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

    const uniqueImages: string[] = [];

    for (let imgIdx = 0; imgIdx < 3; imgIdx++) {
      let seed = hashString(prompt + title) + sceneNumber * 1000 + imgIdx * 137;
      let aspect = imgIdx === 0 ? "wide establishing shot" : imgIdx === 1 ? "detailed focal view" : "dramatic perspective";

      let aiPrompt = generateCinematicPrompt(title, purpose, aspect, sceneNumber);
      let url = getAIImageUrl(aiPrompt, seed);

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

    return {
      ...scene,
      customImageUrl: scene.customImageUrl && !globalUsedUrls.has(scene.customImageUrl) ? scene.customImageUrl : uniqueImages[0],
    };
  });
}
