import { chunkDocument, HybridSearchEngine, KnowledgeGraphEngine, CitationEngine, DocumentChunk } from "@vidren/rag-engine";

export interface IngestionJobPayload {
  jobId: string;
  documentId: string;
  fileName: string;
  fileContent: string;
  mimeType: string;
}

export class DocumentIngestionWorker {
  private hybridEngine = new HybridSearchEngine();
  private graphEngine = new KnowledgeGraphEngine();
  private citationEngine = new CitationEngine();

  public async processDocument(payload: IngestionJobPayload) {
    console.log(`[IngestionWorker] Processing Document ID: ${payload.documentId} (${payload.fileName})`);

    // Step 1: Chunk document with exact offset tracking
    const chunks = chunkDocument(payload.documentId, payload.fileName, payload.fileContent);
    console.log(`[IngestionWorker] Generated ${chunks.length} semantic chunks.`);

    // Step 2: Index in Hybrid BM25 + Vector Search Engine
    this.hybridEngine.indexChunks(chunks);

    // Step 3: Extract Knowledge Graph triples
    chunks.forEach((chunk: DocumentChunk, idx: number) => {
      const nodeId = `node-${chunk.documentId}-${idx}`;
      this.graphEngine.addNode({
        id: nodeId,
        label: `Concept in ${payload.fileName}`,
        type: "concept",
        properties: { snippet: chunk.content.slice(0, 50) },
      });

      if (idx > 0) {
        this.graphEngine.addEdge({
          sourceId: `node-${chunk.documentId}-${idx - 1}`,
          targetId: nodeId,
          relation: "EXPLAINS",
        });
      }
    });

    // Step 4: Build test citations
    const sampleCitation = this.citationEngine.generateCitation(chunks[0]);

    console.log(`[IngestionWorker] Successfully indexed document. Sample Citation:`, sampleCitation);

    return {
      status: "COMPLETED",
      documentId: payload.documentId,
      chunkCount: chunks.length,
      graphNodesCount: chunks.length,
    };
  }
}

// Self-test execution runner if executed directly
if (require.main === module) {
  const worker = new DocumentIngestionWorker();
  worker.processDocument({
    jobId: "job-001",
    documentId: "doc-quantum-paper",
    fileName: "quantum_superposition.pdf",
    fileContent:
      "Quantum Superposition states that a physical system such as an electron exists partly in all its theoretical state configurations simultaneously. When measured, it collapses into a single eigenstate based on Born's Rule probability distribution.",
    mimeType: "application/pdf",
  });
}
