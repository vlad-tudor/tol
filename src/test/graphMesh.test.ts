import { describe, expect, test } from "bun:test";
import { Color, type Mesh, type MeshStandardMaterial } from "three";

import { DEFAULT_SCHEME } from "~/graph/colourSchemes";
import { createTreeOfLife } from "~/graph/treeOfLife";
import { EdgeAttributionKey, NodeAttributionKey } from "~/graph/types";
import {
  applyColours,
  applyLabels,
  applyNodeOutline,
  createGraphObject,
} from "~/three/graphMesh";
import { DEFAULT_STYLE } from "~/three/styles";
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
      DEFAULT_SCHEME,
      DEFAULT_STYLE,
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
      DEFAULT_SCHEME,
      DEFAULT_STYLE,
    );
    applyLabels(group, tree, new Set(), new Set(), DEFAULT_SCHEME, DEFAULT_STYLE);

    for (const mesh of group.children) {
      expect(mesh.children).toHaveLength(0);
    }
  });
});

describe("applyColours", () => {
  test("colours meshes from the scheme, falling back to the palette default", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);
    applyColours(
      group,
      tree,
      { id: "t", name: "T", sephira: { keter: 0xff0000 }, path: { Aleph: 0x00ff00 } },
      DEFAULT_STYLE,
    );

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

describe("applyNodeOutline", () => {
  test("adds a halo hull to each sphere when enabled, removes it when off", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);
    const nodeIds = new Set(tree.nodes.map((node) => node.id));
    const spheres = () =>
      group.children.filter((child) => nodeIds.has(child.name));

    applyNodeOutline(group, tree, true, 0xd8c48a);
    for (const sphere of spheres()) {
      expect(sphere.children).toHaveLength(1);
      expect(sphere.children[0].type).toBe("Mesh");
    }

    applyNodeOutline(group, tree, false, 0xd8c48a);
    for (const sphere of spheres()) {
      expect(sphere.children).toHaveLength(0);
    }
  });
});
