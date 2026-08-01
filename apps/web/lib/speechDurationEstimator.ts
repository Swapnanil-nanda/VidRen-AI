
import { ScenePlan } from "../types";

export function calculateEstimatedSpeechDuration(narration: string, speed: number = 1.0): number {
  const text = (narration || "").trim();
  if (!text) return 5;

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const punctuationCount = (text.match(/[,;:.!?]/g) || []).length;

  const speechSeconds = wordCount / (2.3 * Math.max(speed, 0.5));
  const pauseSeconds = punctuationCount * 0.5;
  const bufferSeconds = 1.5; 

  return Math.ceil(speechSeconds + pauseSeconds + bufferSeconds);
}

export function autoExtendSceneDurations(scenes: ScenePlan[], speed: number = 1.0): ScenePlan[] {
  return scenes.map((scene) => {
    const requiredDur = calculateEstimatedSpeechDuration(scene.narration, speed);
    const currentDur = typeof scene.duration === "number" && scene.duration > 0 ? scene.duration : 10;

    const finalDur = Math.max(currentDur, requiredDur);

    return {
      ...scene,
      duration: finalDur,
    };
  });
}
