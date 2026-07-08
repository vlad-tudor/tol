import { describe, expect, test } from "bun:test";

import { createTreeOfLife } from "~/graph/treeOfLife";
import { createGraphObject } from "~/three/graphMesh";

describe("createGraphObject", () => {
  test("builds one mesh per node and per edge, named by id", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);

    expect(group.children).toHaveLength(tree.nodes.length + tree.edges.length);

    const names = new Set(group.children.map((child) => child.name));
    expect(names.has("keter")).toBe(true);
    expect(names.has("keter-tiferet")).toBe(true);
  });
});
