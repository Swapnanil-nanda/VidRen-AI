import { NextRequest, NextResponse } from "next/server";
import type { GeneratedScript, SceneScript, VisualLayout } from "@/lib/geminiClient";

export const runtime = "nodejs";

const layouts: VisualLayout[] = ["hero-object", "process-flow", "comparison", "architecture", "timeline", "equation"];
const models = ["bloch-sphere", "dna-helix", "neural-net", "torus-geometry", "pendulum-3d", "solar-orbit"] as const;

function durationGuide(target: string) {
  if (target === "quick") return "3–4 scenes. Each narration must be 18–24 words and 7–10 seconds.";
  if (target === "deep_dive") return "10–12 scenes. Each narration must be 42–55 words and 18–24 seconds.";
  return "6–8 scenes. Each narration must be 28–36 words and 12–16 seconds.";
}

function normalize(script: Partial<GeneratedScript>): GeneratedScript {
  if (!Array.isArray(script.scenes) || script.scenes.length === 0) throw new Error("The model returned no scenes.");
  const scenes: SceneScript[] = script.scenes.map((raw, index) => {
    const scene = raw as Partial<SceneScript> & { heading?: string; sceneTitle?: string; voiceover?: string; script?: string };
    const title = scene.title || scene.heading || scene.sceneTitle || `Scene ${index + 1}`;
    const narration = scene.narration || scene.voiceover || scene.script || scene.visualDescription || `This scene explains ${title}.`;
    const inferredTerms = `${scene.visualDescription || ""} ${title || ""}`.split(/[^a-zA-Z0-9+-]+/).filter((term) => term.length > 3).slice(0, 4);
    const elements = (Array.isArray(scene.keyElements) ? scene.keyElements.filter(Boolean) : inferredTerms).slice(0, 4);
    const beats = Array.isArray(scene.visualBeats) ? scene.visualBeats.slice(0, 4) : [];
    return {
      sceneNumber: index + 1,
      title: String(title).slice(0, 90),
      narration: String(narration).trim(),
      visualDescription: String(scene.visualDescription || scene.title).slice(0, 180),
      duration: Math.max(6, Math.min(30, Number(scene.duration) || 12)),
      keyElements: elements.length ? elements : [String(title)],
      modelType: models.includes(scene.modelType as (typeof models)[number]) ? scene.modelType : undefined,
      visualLayout: layouts.includes(scene.visualLayout as VisualLayout) ? scene.visualLayout as VisualLayout : "process-flow",
      visualBeats: (beats.length ? beats : elements.map((label, beatIndex) => ({ at: (beatIndex + 1) / (elements.length + 1), label, action: "introduce" }))).map((beat, beatIndex) => ({
        at: Math.max(0, Math.min(1, Number(beat.at) || (beatIndex + 1) / (beats.length + 1))),
        label: String(beat.label || elements[beatIndex] || "Key idea").slice(0, 48),
        action: (["introduce", "connect", "transform", "emphasize"].includes(beat.action) ? beat.action : "introduce") as SceneScript["visualBeats"][number]["action"],
      })),
      transition: ["fade", "wipe", "cut"].includes(scene.transition || "") ? scene.transition as SceneScript["transition"] : "fade",
    };
  });
  return { title: String(script.title || "Generated video").slice(0, 120), summary: String(script.summary || "").slice(0, 300), totalScenes: scenes.length, scenes };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, targetDuration } = await request.json();
    if (typeof prompt !== "string" || prompt.trim().length < 4) return NextResponse.json({ error: "Enter a more specific topic." }, { status: 400 });
    const apiKey = request.headers.get("x-groq-api-key") || process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Groq is not configured. Add GROQ_API_KEY to apps/web/.env.local, then restart the dev server." }, { status: 503 });

    const promptText = `You are an educational video director. Produce a precise, fact-focused storyboard for: ${prompt.trim()}.

${durationGuide(targetDuration)}
Use only visuals the renderer can represent. visualLayout must be one of: ${layouts.join(", ")}.
modelType is optional and must be one of: ${models.join(", ")}.
Every scene needs 2–4 concrete, topic-specific keyElements and 3–4 visualBeats. Each beat has at (0–1), label, and action (introduce, connect, transform, emphasize). Make the visual description explain exactly what changes on screen. Return JSON only with title, summary, scenes.`;
    const model = process.env.GROQ_STORYBOARD_MODEL || "qwen/qwen3.6-27b";
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: promptText }], response_format: { type: "json_object" }, temperature: 0.3 }),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || `Groq request failed (${response.status}).` }, { status: response.status });
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return NextResponse.json({ error: "Groq returned no storyboard text." }, { status: 502 });
    return NextResponse.json(normalize(JSON.parse(text)));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate storyboard." }, { status: 500 });
  }
}
