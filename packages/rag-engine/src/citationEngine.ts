import { CitationRef, DocumentChunk } from "./types";

export class CitationEngine {
  /**
   * Builds ground-truth citations mapping source text chunks to AST text elements.
   */
  public generateCitation(chunk: DocumentChunk, confidence: number = 0.98): CitationRef {
    return {
      citationId: `cite-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      documentId: chunk.documentId,
      fileName: chunk.fileName,
      snippet: chunk.content.slice(0, 150) + "...",
      startOffset: chunk.startOffset,
      endOffset: chunk.endOffset,
      confidenceScore: confidence,
    };
  }
}
