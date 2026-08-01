import { DocumentChunk } from "./types";

interface ChunkingOptions {
  maxChunkSize?: number;
  overlapSize?: number;
}

/**
 * Optimizes raw document text into semantic chunks with exact character offsets.
 */
export function chunkDocument(
  documentId: string,
  fileName: string,
  rawText: string,
  options: ChunkingOptions = {}
): DocumentChunk[] {
  const maxChunkSize = options.maxChunkSize || 500;
  const overlapSize = options.overlapSize || 50;

  const chunks: DocumentChunk[] = [];
  let currentOffset = 0;
  let chunkIndex = 0;

  while (currentOffset < rawText.length) {
    const endOffset = Math.min(currentOffset + maxChunkSize, rawText.length);
    const content = rawText.slice(currentOffset, endOffset);

    chunks.push({
      chunkId: `${documentId}-chunk-${chunkIndex}`,
      documentId,
      fileName,
      content,
      startOffset: currentOffset,
      endOffset,
      metadata: {
        sectionTitle: `Section ${chunkIndex + 1}`,
      },
    });

    chunkIndex++;
    currentOffset += maxChunkSize - overlapSize;
  }

  return chunks;
}
