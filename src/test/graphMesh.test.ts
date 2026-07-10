import { describe, expect, test } from "bun:test";
import {
  Color,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  Sprite,
} from "three";

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
      const labels = mesh.children.filter((child) => child instanceof Sprite);
      expect(labels).toHaveLength(0);
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
      const labels = mesh.children.filter((child) => child instanceof Sprite);
      expect(labels).toHaveLength(1);
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
      const labels = mesh.children.filter((child) => child instanceof Sprite);
      expect(labels).toHaveLength(0);
    }
  });
});

describe("applyColours", () => {
  const hexOf = (group: ReturnType<typeof createGraphObject>, name: string): number => {
    const mesh = group.children.find((child) => child.name === name) as Mesh;
    return (mesh.material as MeshStandardMaterial).color.getHex();
  };

  test("a coloured scheme paints sephirot and paths and hides the border", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);
    applyColours(
      group,
      tree,
      { id: "c", name: "C", sephira: { keter: 0xff0000 }, path: { Aleph: 0x00ff00 } },
      DEFAULT_STYLE,
    );

    expect(hexOf(group, "keter")).toBe(new Color(0xff0000).getHex()); // sephira override
    expect(hexOf(group, "binah")).toBe(new Color(palette.node).getHex()); // sephira default
    expect(hexOf(group, "keter-chokmah")).toBe(new Color(0x00ff00).getHex()); // Aleph override
    expect(hexOf(group, "keter-binah")).toBe(new Color(palette.edge).getHex()); // path default

    const tube = group.children.find((c) => c.name === "keter-chokmah") as Mesh;
    expect(tube.children[0].visible).toBe(false); // border hidden
  });

  test("the neutral scheme renders white with the path border shown", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);
    applyColours(group, tree, DEFAULT_SCHEME, DEFAULT_STYLE);

    expect(hexOf(group, "keter")).toBe(new Color(DEFAULT_STYLE.pathFill).getHex());
    expect(hexOf(group, "keter-chokmah")).toBe(new Color(DEFAULT_STYLE.pathFill).getHex());

    const border = (group.children.find((c) => c.name === "keter-chokmah") as Mesh)
      .children[0] as Mesh;
    expect(border.visible).toBe(true);
    expect((border.material as MeshBasicMaterial).color.getHex()).toBe(
      new Color(DEFAULT_STYLE.pathBorder).getHex(),
    );
  });
});

describe("applyNodeOutline", () => {
  test("halo follows the toggle, but the neutral scheme forces it on", () => {
    const tree = createTreeOfLife();
    const group = createGraphObject(tree);
    const nodeIds = new Set(tree.nodes.map((node) => node.id));
    const spheres = () =>
      group.children.filter((child) => nodeIds.has(child.name));
    const coloured = { id: "c", name: "C", sephira: {}, path: {} };

    applyNodeOutline(group, tree, coloured, DEFAULT_STYLE, true);
    for (const sphere of spheres()) {
      expect(sphere.children).toHaveLength(1);
      expect(sphere.children[0].type).toBe("Mesh");
    }

    applyNodeOutline(group, tree, coloured, DEFAULT_STYLE, false);
    for (const sphere of spheres()) {
      expect(sphere.children).toHaveLength(0);
    }

    applyNodeOutline(group, tree, DEFAULT_SCHEME, DEFAULT_STYLE, false);
    for (const sphere of spheres()) {
      expect(sphere.children).toHaveLength(1); // neutral scheme forces the outline on
    }
  });
});
