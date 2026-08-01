import { DocumentChunk, SearchResult } from "./types";

export class HybridSearchEngine {
  private chunks: DocumentChunk[] = [];

  public indexChunks(chunks: DocumentChunk[]): void {
    this.chunks = chunks;
  }

  /**
   * Performs hybrid search using Reciprocal Rank Fusion (RRF)
   * RRF Score = 1 / (60 + DenseRank) + 1 / (60 + BM25Rank)
   */
  public search(query: string, limit: number = 5): SearchResult[] {
    if (this.chunks.length === 0) return [];

    const queryTerms = query.toLowerCase().split(/\s+/);

    // Compute BM25 Keyword & Dense similarity scores
    const scored = this.chunks.map((chunk) => {
      const lowerContent = chunk.content.toLowerCase();
      let matchCount = 0;
      queryTerms.forEach((term) => {
        if (lowerContent.includes(term)) matchCount++;
      });

      const bm25Score = matchCount / queryTerms.length;
      // Simulated cosine similarity score for dense embedding space
      const denseScore = 0.5 + 0.5 * bm25Score;

      return { chunk, bm25Score, denseScore };
    });

    // Rank by BM25 & Dense
    const sortedBM25 = [...scored].sort((a, b) => b.bm25Score - a.bm25Score);
    const sortedDense = [...scored].sort((a, b) => b.denseScore - a.denseScore);

    // Calculate Reciprocal Rank Fusion (RRF)
    const k = 60;
    const rrfMap = new Map<string, SearchResult>();

    scored.forEach((item) => {
      const bm25Rank = sortedBM25.findIndex((x) => x.chunk.chunkId === item.chunk.chunkId) + 1;
      const denseRank = sortedDense.findIndex((x) => x.chunk.chunkId === item.chunk.chunkId) + 1;

      const rrfScore = 1 / (k + bm25Rank) + 1 / (k + denseRank);

      rrfMap.set(item.chunk.chunkId, {
        chunk: item.chunk,
        bm25Score: item.bm25Score,
        denseScore: item.denseScore,
        rrfScore,
      });
    });

    return Array.from(rrfMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, limit);
  }
}
