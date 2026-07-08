import {
  type GraphData,
  type GraphEdge,
  type GraphNode,
  PillarPosition,
} from "~/graph/types";

/**
 * The classical (Kircher) Tree of Life: ten sephirot joined by twenty-two
 * paths, across three vertical pillars.
 *
 * The layout carries a little depth to hint at its 3D form: the central pillar
 * leans forward (+Z) and the side pillars lean back (-Z), while Keter (the
 * crown) and Malkuth (the kingdom) stay in the z = 0 plane as anchors. It's
 * only the starting arrangement — the nodes are dragged further into depth
 * from here.
 *
 * Da'at, the "hidden" eleventh sephira, is intentionally omitted: the
 * twenty-two-path tree does not include it.
 */

// Layout parameters, tuned by eye. Middle-pillar nodes sit at x = 0; the side
// pillars stand PILLAR_OFFSET to either side.
const PILLAR_OFFSET = 1.6; // ±X distance of the side pillars from the centre
const CENTRAL_DEPTH = 0.6; // +Z, toward the viewer — the middle pillar leans forward
const SIDE_DEPTH = -0.6; // -Z, away from the viewer — the side pillars lean back

// Positions are centred on the origin so the figure frames itself under the
// default camera target. Left pillar x < 0, right pillar x > 0, middle at 0.
const SEPHIROT: GraphNode[] = [
  { id: "keter", label: "Keter", pillar: PillarPosition.Middle, position: { x: 0, y: 5, z: 0 } },
  { id: "chokmah", label: "Chokmah", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: 3.6, z: SIDE_DEPTH } },
  { id: "binah", label: "Binah", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: 3.6, z: SIDE_DEPTH } },
  { id: "chesed", label: "Chesed", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: 1.2, z: SIDE_DEPTH } },
  { id: "gevurah", label: "Gevurah", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: 1.2, z: SIDE_DEPTH } },
  { id: "tiferet", label: "Tiferet", pillar: PillarPosition.Middle, position: { x: 0, y: 0, z: CENTRAL_DEPTH } },
  { id: "netzach", label: "Netzach", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: -1.6, z: SIDE_DEPTH } },
  { id: "hod", label: "Hod", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: -1.6, z: SIDE_DEPTH } },
  { id: "yesod", label: "Yesod", pillar: PillarPosition.Middle, position: { x: 0, y: -3.2, z: CENTRAL_DEPTH } },
  { id: "malkuth", label: "Malkuth", pillar: PillarPosition.Middle, position: { x: 0, y: -5.8, z: 0 } },
];

// The twenty-two paths, as unordered node-id pairs. Edge ids are derived from
// the endpoints so the two representations can never drift apart.
const PATHS: ReadonlyArray<readonly [string, string]> = [
  ["keter", "chokmah"],
  ["keter", "binah"],
  ["keter", "tiferet"],
  ["chokmah", "binah"],
  ["chokmah", "chesed"],
  ["chokmah", "tiferet"],
  ["binah", "gevurah"],
  ["binah", "tiferet"],
  ["chesed", "gevurah"],
  ["chesed", "tiferet"],
  ["chesed", "netzach"],
  ["gevurah", "tiferet"],
  ["gevurah", "hod"],
  ["tiferet", "netzach"],
  ["tiferet", "hod"],
  ["tiferet", "yesod"],
  ["netzach", "hod"],
  ["netzach", "yesod"],
  ["netzach", "malkuth"],
  ["hod", "yesod"],
  ["hod", "malkuth"],
  ["yesod", "malkuth"],
];

const PATH_EDGES: GraphEdge[] = PATHS.map(
  ([from, to]): GraphEdge => ({ id: `${from}-${to}`, endpoints: [from, to] }),
);

/**
 * Build the canonical Tree of Life.
 *
 * @returns a fresh, independent deep clone every call, so mutating the
 *   rendered/edited graph never touches this template
 */
export function createTreeOfLife(): GraphData {
  return {
    nodes: SEPHIROT.map((node) => ({ ...node, position: { ...node.position } })),
    edges: PATH_EDGES.map(
      (edge): GraphEdge => ({
        id: edge.id,
        endpoints: [edge.endpoints[0], edge.endpoints[1]],
      }),
    ),
  };
}
