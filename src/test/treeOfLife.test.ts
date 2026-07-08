import { describe, expect, test } from "bun:test";

import { nodesById, validateGraph } from "~/graph/graph";
import { createTreeOfLife } from "~/graph/treeOfLife";

describe("Tree of Life dataset", () => {
  test("has ten sephirot and twenty-two paths", () => {
    const tree = createTreeOfLife();
    expect(tree.nodes).toHaveLength(10);
    expect(tree.edges).toHaveLength(22);
  });

  test("is structurally valid", () => {
    expect(validateGraph(createTreeOfLife())).toEqual([]);
  });

  test("crown and kingdom anchor the plane; the pillars lean into depth", () => {
    const nodes = nodesById(createTreeOfLife());
    expect(nodes.get("keter")?.position.z).toBe(0);
    expect(nodes.get("malkuth")?.position.z).toBe(0);
    expect(nodes.get("tiferet")?.position.z).toBeGreaterThan(0);
    expect(nodes.get("yesod")?.position.z).toBeGreaterThan(0);
    expect(nodes.get("binah")?.position.z).toBeLessThan(0);
    expect(nodes.get("chesed")?.position.z).toBeLessThan(0);
  });

  test("every path connects two distinct, existing nodes", () => {
    const tree = createTreeOfLife();
    const ids = new Set(tree.nodes.map((node) => node.id));
    for (const edge of tree.edges) {
      const [from, to] = edge.endpoints;
      expect(ids.has(from)).toBe(true);
      expect(ids.has(to)).toBe(true);
      expect(from).not.toBe(to);
    }
  });

  test("each call returns an independent copy", () => {
    const first = createTreeOfLife();
    const second = createTreeOfLife();
    first.nodes[0].position.x = 999;
    expect(second.nodes[0].position.x).not.toBe(999);
  });
});
