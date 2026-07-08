import { describe, expect, test } from "bun:test";

import {
  edgesForNode,
  neighborIds,
  nodesById,
  validateGraph,
} from "~/graph/graph";
import type { GraphData } from "~/graph/types";

const chain: GraphData = {
  nodes: [
    { id: "a", label: "A", pillar: "left", position: { x: 0, y: 0, z: 0 } },
    { id: "b", label: "B", pillar: "middle", position: { x: 1, y: 0, z: 0 } },
    { id: "c", label: "C", pillar: "right", position: { x: 2, y: 0, z: 0 } },
  ],
  edges: [
    { id: "a-b", endpoints: ["a", "b"] },
    { id: "b-c", endpoints: ["b", "c"] },
  ],
};

describe("nodesById", () => {
  test("indexes every node by its id", () => {
    const index = nodesById(chain);
    expect(index.size).toBe(3);
    expect(index.get("b")?.label).toBe("B");
  });
});

describe("edgesForNode", () => {
  test("returns every incident edge, in either endpoint position", () => {
    expect(edgesForNode(chain, "b").map((edge) => edge.id)).toEqual([
      "a-b",
      "b-c",
    ]);
  });

  test("returns nothing for an unconnected id", () => {
    expect(edgesForNode(chain, "z")).toEqual([]);
  });
});

describe("neighborIds", () => {
  test("returns the node on the far end of each incident edge", () => {
    expect(neighborIds(chain, "b").sort()).toEqual(["a", "c"]);
  });
});

describe("validateGraph", () => {
  test("accepts a well-formed graph", () => {
    expect(validateGraph(chain)).toEqual([]);
  });

  test("flags an edge that references a missing node", () => {
    const broken: GraphData = {
      nodes: chain.nodes,
      edges: [{ id: "a-x", endpoints: ["a", "x"] }],
    };
    expect(validateGraph(broken)).toContain(
      "Edge a-x references missing node: x",
    );
  });

  test("flags duplicate node ids", () => {
    const duplicated: GraphData = {
      nodes: [...chain.nodes, chain.nodes[0]],
      edges: [],
    };
    expect(validateGraph(duplicated)).toContain("Duplicate node id: a");
  });

  test("flags a self-loop", () => {
    const looped: GraphData = {
      nodes: chain.nodes,
      edges: [{ id: "a-a", endpoints: ["a", "a"] }],
    };
    expect(validateGraph(looped)).toContain("Self-loop on node: a");
  });
});
