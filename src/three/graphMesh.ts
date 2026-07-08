import { Group } from "three";

import { nodesById } from "~/graph/graph";
import type { GraphData } from "~/graph/types";
import { createSphere, createTube } from "~/three/meshes";

/**
 * Build the renderable form of a graph: one sphere per node, one tube per edge,
 * all parented under a single Group.
 *
 * @param graph - the graph to render
 * @returns a Group holding a sphere for every node and a tube for every edge;
 *   each mesh carries its node or edge id as `name`, so a later interaction
 *   layer can map a picked mesh back to the graph
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
