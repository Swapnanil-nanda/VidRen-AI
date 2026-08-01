import { VidRenDocumentAST } from "./types";
import { VidRenDocumentASTSchema } from "./schemas";

export interface ParseResult {
  success: boolean;
  data?: Partial<VidRenDocumentAST>;
  error?: string;
  isPartial: boolean;
}

/**
 * Incremental AST parser for streaming LLM JSON output.
 * Safely parses incomplete JSON buffers during Server-Sent Events (SSE).
 */
export function parseStreamingAST(jsonBuffer: string): ParseResult {
  const trimmed = jsonBuffer.trim();
  if (!trimmed) {
    return { success: false, isPartial: true, error: "Empty buffer" };
  }

  // Attempt strict full parse first
  try {
    const fullParsed = JSON.parse(trimmed);
    const validated = VidRenDocumentASTSchema.safeParse(fullParsed);
    if (validated.success) {
      return { success: true, data: validated.data as VidRenDocumentAST, isPartial: false };
    }
  } catch (_e) {
    // Falls through to partial repair
  }

  // Repair incomplete JSON syntax for partial render
  try {
    const repairedJSON = repairPartialJSON(trimmed);
    const partialParsed = JSON.parse(repairedJSON);
    return {
      success: true,
      data: partialParsed as Partial<VidRenDocumentAST>,
      isPartial: true,
    };
  } catch (err: any) {
    return {
      success: false,
      isPartial: true,
      error: `Partial parse error: ${err.message}`,
    };
  }
}

/**
 * Best-effort repair strategy for streaming JSON syntax (unclosed brackets/quotes).
 */
function repairPartialJSON(jsonString: string): string {
  let stack: string[] = [];
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
    } else if (char === "}" || char === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === char) {
        stack.pop();
      }
    }
  }

  let repaired = jsonString;

  // Close unclosed string
  if (inString) {
    repaired += '"';
  }

  // Close unclosed objects/arrays in reverse order
  while (stack.length > 0) {
    repaired += stack.pop();
  }

  return repaired;
}
