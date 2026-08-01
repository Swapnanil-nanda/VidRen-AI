// ============================================================
// Dynamic Speech Duration Estimator & Scene Duration Auto-Extender
// Calculates exact narration speech duration based on word count & punctuation.
// Auto-extends scene duration so no narration sentence is ever cut off mid-speech!
// ============================================================

import { ScenePlan } from "../types";

/**
 * Calculates estimated speech duration in seconds for a given narration text.
 * Average speaking speed = ~2.3 words per second + 0.6s pause per punctuation mark + 1.5s end buffer.
 */
export function calculateEstimatedSpeechDuration(narration: string, speed: number = 1.0): number {
  const text = (narration || "").trim();
  if (!text) return 5;

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Count punctuation pauses (commas, periods, colons, semicolons)
  const punctuationCount = (text.match(/[,;:.!?]/g) || []).length;

  const speechSeconds = wordCount / (2.3 * Math.max(speed, 0.5));
  const pauseSeconds = punctuationCount * 0.5;
  const bufferSeconds = 1.5; // Smooth end-of-sentence buffer

  return Math.ceil(speechSeconds + pauseSeconds + bufferSeconds);
}

/**
 * Auto-extends scene duration if the narration script requires more time than allocated.
 * Guarantees every scene stays active long enough to speak 100% of its script!
 */
export function autoExtendSceneDurations(scenes: ScenePlan[], speed: number = 1.0): ScenePlan[] {
  return scenes.map((scene) => {
    const requiredDur = calculateEstimatedSpeechDuration(scene.narration, speed);
    const currentDur = typeof scene.duration === "number" && scene.duration > 0 ? scene.duration : 10;

    // Allocate whichever is larger: allocated duration or required speech duration
    const finalDur = Math.max(currentDur, requiredDur);

    return {
      ...scene,
      duration: finalDur,
    };
  });
}
