// ============================================================
// ML / Keyword Image Relevance Verification Engine
// Integrates Keyword Verification Engine to validate image inputs.
// ============================================================

import { verifyImageInput, generateVerificationKeywords } from "./keywordVerificationEngine";

export function verifyImageRelevance(url: string | null, title: string, purpose: string = "", prompt: string = ""): boolean {
  const result = verifyImageInput(url, prompt, title, purpose);
  return result.isVerified;
}

export { generateVerificationKeywords, verifyImageInput };
