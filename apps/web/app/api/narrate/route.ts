import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const voices: Record<string, string> = {
  alloy: "austin",
  echo: "troy",
  fable: "hannah",
  nova: "hannah",
};

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "nova" } = await request.json();
    if (typeof text !== "string" || !text.trim()) return NextResponse.json({ error: "Narration text is required." }, { status: 400 });
    const apiKey = request.headers.get("x-groq-api-key") || process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Groq is not configured for narration." }, { status: 503 });
    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROQ_TTS_MODEL || "canopylabs/orpheus-v1-english",
        voice: voices[voice] || voices.nova,
        input: text,
        response_format: "wav",
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      return NextResponse.json({ error: data?.error?.message || `Groq narration request failed (${response.status}).` }, { status: response.status });
    }
    return new NextResponse(await response.arrayBuffer(), { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate narration." }, { status: 500 });
  }
}
