import { ScenePlan } from "../types";

export function buildLinearMasterScript(scenes: ScenePlan[], prompt: string): string {
  if (!scenes || scenes.length === 0) return "";

  const humanTransitions = [
    "Now, if we look closely,",
    "Here's the interesting part—",
    "Notice how,",
    "Naturally,",
    "So,",
    "Yet,",
    "Key thing to realize is,",
    "In practice,"
  ];

  const cleanSentences: string[] = [];

  scenes.forEach((scene, idx) => {
    let text = (scene.narration || "").trim();
    if (!text) return;

    text = text.replace(/^(stage|step|part|phase|scene)\s+\d+[:\s-]*/i, "");
    text = text.replace(/^(beginning with|examining the|moving on to|next we observe|in this section|furthermore|additionally|turning to)[:\s,]*/i, "");

    text = text.charAt(0).toLowerCase() + text.slice(1);

    if (idx > 0 && idx % 3 === 0) {
      const transition = humanTransitions[idx % humanTransitions.length];
      text = `${transition} ${text}`;
    } else {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    if (!/[.!?]$/.test(text)) {
      text += ".";
    }

    cleanSentences.push(text);
  });

  return cleanSentences.join(" ");
}

export interface VisualStageTimeline {
  sceneIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export function buildVisualStageTimeline(scenes: ScenePlan[]): VisualStageTimeline[] {
  let currentTime = 0;
  return scenes.map((scene, idx) => {
    const dur = typeof scene.duration === "number" && scene.duration > 0 ? scene.duration : 10;
    const item: VisualStageTimeline = {
      sceneIndex: idx,
      startTime: currentTime,
      endTime: currentTime + dur,
      duration: dur,
    };
    currentTime += dur;
    return item;
  });
}
