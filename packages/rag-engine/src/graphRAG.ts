import { GraphNode, GraphEdge } from "./types";

export class KnowledgeGraphEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: GraphEdge): void {
    this.edges.push(edge);
  }

  /**
   * Performs multi-hop Graph traversal to retrieve connected concepts.
   */
  public queryGraph(startNodeId: string, maxDepth: number = 2): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const visitedNodes = new Set<string>();
    const resultNodes: GraphNode[] = [];
    const resultEdges: GraphEdge[] = [];

    const queue: { nodeId: string; depth: number }[] = [{ nodeId: startNodeId, depth: 0 }];
    visitedNodes.add(startNodeId);

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      const node = this.nodes.get(nodeId);
      if (node) resultNodes.push(node);

      if (depth < maxDepth) {
        const connectedEdges = this.edges.filter(
          (e) => e.sourceId === nodeId || e.targetId === nodeId
        );

        connectedEdges.forEach((edge) => {
          resultEdges.push(edge);
          const neighborId = edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
          if (!visitedNodes.has(neighborId)) {
            visitedNodes.add(neighborId);
            queue.push({ nodeId: neighborId, depth: depth + 1 });
          }
        });
      }
    }

    return { nodes: resultNodes, edges: resultEdges };
  }
}
