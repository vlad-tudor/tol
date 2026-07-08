import type { GraphData, GraphEdge, GraphNode } from "~/graph/types";

/** Index nodes by id for O(1) lookup. */
export function nodesById(graph: GraphData): Map<string, GraphNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

/**
 * Every edge that touches `nodeId`, regardless of direction. This is the exact
 * set of tubes to rebuild when a node is dragged to a new position.
 */
export function edgesForNode(graph: GraphData, nodeId: string): GraphEdge[] {
  return graph.edges.filter(
    (edge) => edge.source === nodeId || edge.target === nodeId,
  );
}

/** The ids of every node directly connected to `nodeId`. */
export function neighborIds(graph: GraphData, nodeId: string): string[] {
  return edgesForNode(graph, nodeId).map((edge) =>
    edge.source === nodeId ? edge.target : edge.source,
  );
}

/**
 * Structural problems with a graph, as human-readable messages. An empty array
 * means the graph is well-formed: unique node and edge ids, no self-loops, and
 * every edge endpoint resolving to a real node. Used both as a test oracle and
 * as the guard when loading untrusted JSON.
 */
export function validateGraph(graph: GraphData): string[] {
  const problems: string[] = [];

  const nodeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) {
      problems.push(`Duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      problems.push(`Duplicate edge id: ${edge.id}`);
    }
    edgeIds.add(edge.id);

    if (edge.source === edge.target) {
      problems.push(`Self-loop on node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.source)) {
      problems.push(`Edge ${edge.id} references missing node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      problems.push(`Edge ${edge.id} references missing node: ${edge.target}`);
    }
  }

  return problems;
}
