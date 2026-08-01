export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  fileName: string;
  content: string;
  startOffset: number;
  endOffset: number;
  metadata: {
    pageNumber?: number;
    sectionTitle?: string;
    mimeType?: string;
  };
}

export interface SearchResult {
  chunk: DocumentChunk;
  denseScore: number;
  bm25Score: number;
  rrfScore: number; // Combined Reciprocal Rank Fusion score
}

export interface GraphNode {
  id: string;
  label: string;
  type: "concept" | "entity" | "equation" | "code_symbol";
  properties?: Record<string, any>;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relation: "DEPENDS_ON" | "EXPLAINS" | "IMPLEMENTS" | "DERIVED_FROM";
  weight?: number;
}

export interface CitationRef {
  citationId: string;
  documentId: string;
  fileName: string;
  snippet: string;
  startOffset: number;
  endOffset: number;
  confidenceScore: number;
}
