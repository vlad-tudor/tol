import { Group } from "three";

import { nodesById } from "~/graph/graph";
import type { GraphData } from "~/graph/types";
import { createLabel } from "~/three/label";
import { createSphere, createTube } from "~/three/meshes";

const LABEL_OFFSET_Y = 0.85; // world units above a node's centre

/**
 * Build the renderable form of a graph: one sphere per node (with its name
 * label as a billboarded child), one tube per edge, all parented under a single
 * Group.
 *
 * @param graph - the graph to render
 * @returns a Group holding a sphere for every node and a tube for every edge;
 *   each mesh carries its node or edge id as `name`, so a later interaction
 *   layer can map a picked mesh back to the graph. Each sphere parents its label
 *   so the label follows the node when it moves.
 */
export function createGraphObject(graph: GraphData): Group {
  const group = new Group();
  const nodeIndex = nodesById(graph);

  for (const node of graph.nodes) {
    const sphere = createSphere(node.position);
    sphere.name = node.id;

    const label = createLabel(node.label);
    label.position.set(0, LABEL_OFFSET_Y, 0);
    sphere.add(label);

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
