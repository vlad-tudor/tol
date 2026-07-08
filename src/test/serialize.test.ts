import { describe, expect, test } from "bun:test";

import { deserializeGraph, serializeGraph } from "~/graph/serialize";
import { createTreeOfLife } from "~/graph/treeOfLife";

describe("serialize / deserialize", () => {
  test("round-trips a graph without loss", () => {
    const tree = createTreeOfLife();
    expect(deserializeGraph(serializeGraph(tree))).toEqual(tree);
  });

  test("preserves sculpted 3D positions", () => {
    const tree = createTreeOfLife();
    tree.nodes[0].position.z = 4.2;
    const restored = deserializeGraph(serializeGraph(tree));
    expect(restored.nodes[0].position.z).toBe(4.2);
  });

  test("rejects an unknown schema version", () => {
    const payload = JSON.stringify({ version: 999, graph: createTreeOfLife() });
    expect(() => deserializeGraph(payload)).toThrow(/Unsupported graph version/);
  });

  test("rejects a structurally invalid graph", () => {
    const payload = JSON.stringify({
      version: 1,
      graph: { nodes: [], edges: [{ id: "x", source: "a", target: "b" }] },
    });
    expect(() => deserializeGraph(payload)).toThrow(/Invalid graph/);
  });
});
