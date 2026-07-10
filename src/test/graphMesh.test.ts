import { describe, expect, test } from "bun:test";
import { Color, type Mesh, type MeshStandardMaterial } from "three";

import { createTreeOfLife } from "~/graph/treeOfLife";
import { EdgeAttributionKey, NodeAttributionKey } from "~/graph/types";
import { applyColours, applyLabels, createGraphObject } from "~/three/graphMesh";
import { palette } from "~/theme/palette";

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

describe("applyColours", () => {
  test("colours meshes from the scheme, falling back to the palette default", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);
    applyColours(group, tree, {
      id: "t",
      name: "T",
      sephira: { keter: 0xff0000 },
      path: { Aleph: 0x00ff00 },
    });

    const hex = (name: string): number => {
      const mesh = group.children.find((child) => child.name === name) as Mesh;
      return (mesh.material as MeshStandardMaterial).color.getHex();
    };

    expect(hex("keter")).toBe(new Color(0xff0000).getHex()); // scheme override
    expect(hex("keter-chokmah")).toBe(new Color(0x00ff00).getHex()); // Aleph override
    expect(hex("binah")).toBe(new Color(palette.node).getHex()); // no override → default
    expect(hex("keter-binah")).toBe(new Color(palette.edge).getHex()); // Beth → default
  });
});
