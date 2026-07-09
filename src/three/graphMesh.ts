import { Group } from "three";

import { nodesById } from "~/graph/graph";
import {
  type Attributions,
  EdgeAttributionKey,
  type GraphData,
  NodeAttributionKey,
} from "~/graph/types";
import { createLabel } from "~/three/label";
import { createSphere, createTube } from "~/three/meshes";

const NODE_LABEL_GAP = 0.65; // world units from a node's centre to the label's base

// Which attribution categories are currently shown. Hardcoded for now; a
// reactive menu will drive these once the toggle UI lands.
const VISIBLE_NODE_ATTRIBUTIONS: readonly string[] = [
  NodeAttributionKey.Name,
  NodeAttributionKey.Number,
];
const VISIBLE_EDGE_ATTRIBUTIONS: readonly string[] = [
  EdgeAttributionKey.LetterName,
  EdgeAttributionKey.PathNumber,
];

/** The visible attribution values, in the given category order. */
function visibleLines(
  attributions: Attributions | undefined,
  keys: readonly string[],
): string[] {
  if (!attributions) return [];
  return keys
    .map((key) => attributions[key])
    .filter((value): value is string => Boolean(value));
}

/**
 * Build the renderable form of a graph: one sphere per node, one tube per edge,
 * each carrying a billboarded label of its visible attributions, all parented
 * under a single Group.
 *
 * @param graph - the graph to render
 * @returns a Group holding a sphere for every node and a tube for every edge;
 *   each mesh carries its id as `name` (for later picking) and parents its label
 *   so the label follows the mesh when it moves
 */
export function createGraphObject(graph: GraphData): Group {
  const group = new Group();
  const nodeIndex = nodesById(graph);

  for (const node of graph.nodes) {
    const sphere = createSphere(node.position);
    sphere.name = node.id;

    const lines = visibleLines(node.attributions, VISIBLE_NODE_ATTRIBUTIONS);
    if (lines.length > 0) {
      const label = createLabel(lines);
      label.position.set(0, NODE_LABEL_GAP + label.scale.y / 2, 0);
      sphere.add(label);
    }

    group.add(sphere);
  }

  for (const edge of graph.edges) {
    const [fromId, toId] = edge.endpoints;
    const from = nodeIndex.get(fromId);
    const to = nodeIndex.get(toId);
    if (!from || !to) continue;

    const tube = createTube(from.position, to.position);
    tube.name = edge.id;

    const lines = visibleLines(edge.attributions, VISIBLE_EDGE_ATTRIBUTIONS);
    if (lines.length > 0) {
      const label = createLabel(lines);
      // The tube mesh sits at the origin (its geometry holds world coords), so a
      // world-space midpoint is the label's local position.
      label.position.set(
        (from.position.x + to.position.x) / 2,
        (from.position.y + to.position.y) / 2,
        (from.position.z + to.position.z) / 2,
      );
      tube.add(label);
    }

    group.add(tube);
  }

  return group;
}
