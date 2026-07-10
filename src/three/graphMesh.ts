import { Group, Mesh, type MeshStandardMaterial, type Object3D, Sprite } from "three";

import { nodesById } from "~/graph/graph";
import {
  type Attributions,
  type ColourScheme,
  EdgeAttributionKey,
  type GraphData,
} from "~/graph/types";
import { createLabel, type LabelStyle } from "~/three/label";
import { createSphere, createTube } from "~/three/meshes";
import { palette } from "~/theme/palette";

const INITIAL_ROTATION = 0.4; // radians (~23°) — a slight spawn tilt on X and Y to reveal the depth

// Node labels sit on the spheres in a dark ink; path labels take the tube's
// lighter colour and render a touch smaller — they're secondary, and there are
// twenty-two of them.
const NODE_LABEL_STYLE: LabelStyle = {
  color: palette.nodeLabel,
  lineWorldHeight: 0.42,
};
const EDGE_LABEL_STYLE: LabelStyle = {
  color: palette.edgeLabel,
  lineWorldHeight: 0.34,
};

/**
 * Build the geometry of a graph: one sphere per node, one tube per edge, all
 * parented under a single Group. Labels and colours are *not* built here —
 * they're applied (and re-applied on toggle) by {@link applyLabels} and
 * {@link applyColours}.
 *
 * @param graph - the graph to render
 * @returns a Group holding a sphere for every node and a tube for every edge;
 *   each mesh carries its id as `name`, so labels, colours, and picking find it
 */
export function createGraphObject(graph: GraphData): Group {
  const group = new Group();
  group.rotation.x = INITIAL_ROTATION;
  group.rotation.y = INITIAL_ROTATION;
  const nodeIndex = nodesById(graph);

  for (const node of graph.nodes) {
    const sphere = createSphere(node.position);
    sphere.name = node.id;
    group.add(sphere);
  }

  for (const edge of graph.edges) {
    const [fromId, toId] = edge.endpoints;
    const from = nodeIndex.get(fromId);
    const to = nodeIndex.get(toId);
    if (!from || !to) continue;

    const tube = createTube(from.position, to.position);
    tube.name = edge.id;
    group.add(tube);
  }

  return group;
}

/**
 * (Re)build the labels on a graph's meshes to reflect which attribution
 * categories are visible. Idempotent — call it again with different sets and it
 * replaces each label. The bridge from the reactive visibility signals to the
 * imperative three.js scene.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param nodeKeys - the node attribution categories to show
 * @param edgeKeys - the edge attribution categories to show
 */
export function applyLabels(
  group: Group,
  graph: GraphData,
  nodeKeys: ReadonlySet<string>,
  edgeKeys: ReadonlySet<string>,
): void {
  const meshById = new Map(group.children.map((child) => [child.name, child]));
  const nodeIndex = nodesById(graph);

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!mesh) continue;
    const lines = visibleLines(node.attributions, nodeKeys);
    setLabel(mesh, lines, NODE_LABEL_STYLE, (label) => {
      label.position.set(0, 0, 0); // centred on the sphere
    });
  }

  for (const edge of graph.edges) {
    const mesh = meshById.get(edge.id);
    const [fromId, toId] = edge.endpoints;
    const from = nodeIndex.get(fromId);
    const to = nodeIndex.get(toId);
    if (!mesh || !from || !to) continue;
    const lines = visibleLines(edge.attributions, edgeKeys);
    setLabel(mesh, lines, EDGE_LABEL_STYLE, (label) => {
      // The tube sits at the origin (its geometry holds world coords), so a
      // world-space midpoint is the label's local position.
      label.position.set(
        (from.position.x + to.position.x) / 2,
        (from.position.y + to.position.y) / 2,
        (from.position.z + to.position.z) / 2,
      );
    });
  }
}

/**
 * Colour a graph's meshes from a colour scheme. Sephira colours key by node id,
 * path colours by letter name; anything the scheme omits falls back to the
 * palette default. The bridge from the active-scheme signal to the scene.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param scheme - the colour scheme to apply
 */
export function applyColours(
  group: Group,
  graph: GraphData,
  scheme: ColourScheme,
): void {
  const meshById = new Map(group.children.map((child) => [child.name, child]));

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!(mesh instanceof Mesh)) continue;
    const colour = scheme.sephira[node.id] ?? palette.node;
    (mesh.material as MeshStandardMaterial).color.setHex(colour);
  }

  for (const edge of graph.edges) {
    const mesh = meshById.get(edge.id);
    if (!(mesh instanceof Mesh)) continue;
    const letter = edge.attributions?.[EdgeAttributionKey.LetterName];
    const colour = (letter ? scheme.path[letter] : undefined) ?? palette.edge;
    (mesh.material as MeshStandardMaterial).color.setHex(colour);
  }
}

/** The visible attribution values, in the attributions' own category order. */
function visibleLines(
  attributions: Attributions | undefined,
  keys: ReadonlySet<string>,
): string[] {
  if (!attributions) return [];
  return Object.entries(attributions)
    .filter(([key]) => keys.has(key))
    .map(([, value]) => value);
}

/** Replace a mesh's label sprite with a fresh one for `lines` (or none). */
function setLabel(
  mesh: Object3D,
  lines: string[],
  style: LabelStyle,
  place: (label: Sprite) => void,
): void {
  for (const child of [...mesh.children]) {
    if (child instanceof Sprite) {
      mesh.remove(child);
      child.material.map?.dispose();
      child.material.dispose();
    }
  }
  if (lines.length === 0) return;

  const label = createLabel(lines, style);
  place(label);
  mesh.add(label);
}
