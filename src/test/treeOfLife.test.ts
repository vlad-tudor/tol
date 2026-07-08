import { describe, expect, test } from "bun:test";

import { validateGraph } from "~/graph/graph";
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

  test("starts flat on the z = 0 plane", () => {
    for (const node of createTreeOfLife().nodes) {
      expect(node.position.z).toBe(0);
    }
  });

  test("every path connects two distinct, existing nodes", () => {
    const tree = createTreeOfLife();
    const ids = new Set(tree.nodes.map((node) => node.id));
    for (const edge of tree.edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
      expect(edge.source).not.toBe(edge.target);
    }
  });

  test("each call returns an independent copy", () => {
    const first = createTreeOfLife();
    const second = createTreeOfLife();
    first.nodes[0].position.x = 999;
    expect(second.nodes[0].position.x).not.toBe(999);
  });
});
