import type { GraphData, GraphEdge, GraphNode } from "~/graph/types";

/**
 * Index a graph's nodes by id for O(1) lookup.
 *
 * @param graph - the graph whose nodes to index
 * @returns a Map from node id to the corresponding {@link GraphNode}
 */
export function nodesById(graph: GraphData): Map<string, GraphNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

/**
 * Find every edge incident to a node. Edges are undirected, so this just asks
 * whether the node id appears in each edge's endpoint pair.
 *
 * @param graph - the graph to search
 * @param nodeId - the node whose edges to collect
 * @returns the incident edges — exactly the tubes to rebuild when the node moves
 */
export function edgesForNode(graph: GraphData, nodeId: string): GraphEdge[] {
  return graph.edges.filter((edge) => edge.endpoints.includes(nodeId));
}

/**
 * List the ids of every node directly connected to a node.
 *
 * @param graph - the graph to search
 * @param nodeId - the node whose neighbours to find
 * @returns the id on the far end of each incident edge
 */
export function neighborIds(graph: GraphData, nodeId: string): string[] {
  return edgesForNode(graph, nodeId).flatMap((edge) =>
    edge.endpoints.filter((endpoint) => endpoint !== nodeId),
  );
}

/**
 * Check a graph for structural problems.
 *
 * @param graph - the graph to validate
 * @returns one human-readable message per problem found — duplicate node or
 *   edge ids, self-loops, and edges referencing a missing node; an empty array
 *   means the graph is well-formed
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

    const [from, to] = edge.endpoints;
    if (from === to) {
      problems.push(`Self-loop on node: ${from}`);
    }
    for (const endpoint of edge.endpoints) {
      if (!nodeIds.has(endpoint)) {
        problems.push(`Edge ${edge.id} references missing node: ${endpoint}`);
      }
    }
  }

  return problems;
}
