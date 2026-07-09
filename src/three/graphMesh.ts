import { Group, type Object3D, Sprite } from "three";

import { nodesById } from "~/graph/graph";
import type { Attributions, GraphData } from "~/graph/types";
import { createLabel } from "~/three/label";
import { createSphere, createTube } from "~/three/meshes";

const NODE_LABEL_GAP = 0.65; // world units from a node's centre to the label's base

/**
 * Build the geometry of a graph: one sphere per node, one tube per edge, all
 * parented under a single Group. Labels are *not* built here — they're applied
 * (and re-applied on toggle) by {@link applyLabels}.
 *
 * @param graph - the graph to render
 * @returns a Group holding a sphere for every node and a tube for every edge;
 *   each mesh carries its id as `name`, so labels and picking can find it
 */
export function createGraphObject(graph: GraphData): Group {
  const group = new Group();
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
 * replaces each label. This is the bridge from the reactive visibility signals
 * to the imperative three.js scene.
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
    setLabel(mesh, visibleLines(node.attributions, nodeKeys), (label) => {
      label.position.set(0, NODE_LABEL_GAP + label.scale.y / 2, 0);
    });
  }

  for (const edge of graph.edges) {
    const mesh = meshById.get(edge.id);
    const [fromId, toId] = edge.endpoints;
    const from = nodeIndex.get(fromId);
    const to = nodeIndex.get(toId);
    if (!mesh || !from || !to) continue;
    setLabel(mesh, visibleLines(edge.attributions, edgeKeys), (label) => {
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

  const label = createLabel(lines);
  place(label);
  mesh.add(label);
}
