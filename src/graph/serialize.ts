import { validateGraph } from "~/graph/graph";
import type { GraphData } from "~/graph/types";

const SCHEMA_VERSION = 1;

interface GraphEnvelope {
  version: number;
  graph: GraphData;
}

/** Serialize a graph to a versioned, pretty-printed JSON string for storage. */
export function serializeGraph(graph: GraphData): string {
  const envelope: GraphEnvelope = { version: SCHEMA_VERSION, graph };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Parse a graph from a string produced by {@link serializeGraph}. This is the
 * single boundary where untrusted JSON becomes a trusted {@link GraphData}, so
 * it throws on anything malformed: bad JSON, an unknown version, a missing
 * payload, or a structurally invalid graph.
 */
export function deserializeGraph(json: string): GraphData {
  const parsed = JSON.parse(json) as Partial<GraphEnvelope>;

  if (parsed.version !== SCHEMA_VERSION) {
    throw new Error(
      `Unsupported graph version: ${parsed.version ?? "missing"} (expected ${SCHEMA_VERSION})`,
    );
  }
  if (!parsed.graph) {
    throw new Error("Graph payload is missing");
  }

  const problems = validateGraph(parsed.graph);
  if (problems.length > 0) {
    throw new Error(`Invalid graph: ${problems.join("; ")}`);
  }

  return parsed.graph;
}
