import { describe, expect, test } from "bun:test";

import { createTreeOfLife } from "~/graph/treeOfLife";
import { EdgeAttributionKey, NodeAttributionKey } from "~/graph/types";
import { applyLabels, createGraphObject } from "~/three/graphMesh";

describe("createGraphObject", () => {
  test("builds one mesh per node and per edge, named by id, with no labels", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);

    expect(group.children).toHaveLength(tree.nodes.length + tree.edges.length);

    const names = new Set(group.children.map((child) => child.name));
    expect(names.has("keter")).toBe(true);
    expect(names.has("keter-tiferet")).toBe(true);

    for (const mesh of group.children) {
      expect(mesh.children).toHaveLength(0);
    }
  });
});

describe("applyLabels", () => {
  test("attaches a billboarded label for the visible attributions", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);

    applyLabels(
      group,
      tree,
      new Set([NodeAttributionKey.Name]),
      new Set([EdgeAttributionKey.LetterName]),
    );

    for (const mesh of group.children) {
      expect(mesh.children).toHaveLength(1);
      expect(mesh.children[0].type).toBe("Sprite");
    }
  });

  test("replaces labels on re-apply and clears them when nothing is visible", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);

    applyLabels(
      group,
      tree,
      new Set([NodeAttributionKey.Name]),
      new Set([EdgeAttributionKey.LetterName]),
    );
    applyLabels(group, tree, new Set(), new Set());

    for (const mesh of group.children) {
      expect(mesh.children).toHaveLength(0);
    }
  });
});
