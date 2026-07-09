import {
  type Attributions,
  EdgeAttributionKey,
  type GraphData,
  type GraphEdge,
  type GraphNode,
  NodeAttributionKey,
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
 * Path attributions (letter, number) follow the standard Golden Dawn / Kircher
 * mapping. Da'at, the "hidden" eleventh sephira, is intentionally omitted: the
 * twenty-two-path tree does not include it.
 */

// Layout parameters, tuned by eye. Middle-pillar nodes sit at x = 0; the side
// pillars stand PILLAR_OFFSET to either side.
const PILLAR_OFFSET = 1.6; // ±X distance of the side pillars from the centre
const CENTRAL_DEPTH = 0.6; // +Z, toward the viewer — the middle pillar leans forward
const SIDE_DEPTH = -0.6; // -Z, away from the viewer — the side pillars lean back

function nodeAttributions(name: string, number: number): Attributions {
  return {
    [NodeAttributionKey.Name]: name,
    [NodeAttributionKey.Number]: String(number),
  };
}

function edgeAttributions(letterName: string, pathNumber: number): Attributions {
  return {
    [EdgeAttributionKey.LetterName]: letterName,
    [EdgeAttributionKey.PathNumber]: String(pathNumber),
  };
}

// Positions are centred on the origin so the figure frames itself under the
// default camera target. Left pillar x < 0, right pillar x > 0, middle at 0.
const SEPHIROT: GraphNode[] = [
  { id: "keter", pillar: PillarPosition.Middle, position: { x: 0, y: 5, z: 0 }, attributions: nodeAttributions("Keter", 1) },
  { id: "chokmah", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: 3.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Chokmah", 2) },
  { id: "binah", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: 3.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Binah", 3) },
  { id: "chesed", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: 1.2, z: SIDE_DEPTH }, attributions: nodeAttributions("Chesed", 4) },
  { id: "gevurah", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: 1.2, z: SIDE_DEPTH }, attributions: nodeAttributions("Gevurah", 5) },
  { id: "tiferet", pillar: PillarPosition.Middle, position: { x: 0, y: 0, z: CENTRAL_DEPTH }, attributions: nodeAttributions("Tiferet", 6) },
  { id: "netzach", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: -1.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Netzach", 7) },
  { id: "hod", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: -1.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Hod", 8) },
  { id: "yesod", pillar: PillarPosition.Middle, position: { x: 0, y: -3.2, z: CENTRAL_DEPTH }, attributions: nodeAttributions("Yesod", 9) },
  { id: "malkuth", pillar: PillarPosition.Middle, position: { x: 0, y: -5.8, z: 0 }, attributions: nodeAttributions("Malkuth", 10) },
];

// The twenty-two paths, as unordered node-id pairs with their letter and number
// attributions. Edge ids are derived from the endpoints so the two
// representations can never drift apart.
const PATHS: ReadonlyArray<{
  from: string;
  to: string;
  letterName: string;
  pathNumber: number;
}> = [
  { from: "keter", to: "chokmah", letterName: "Aleph", pathNumber: 11 },
  { from: "keter", to: "binah", letterName: "Beth", pathNumber: 12 },
  { from: "keter", to: "tiferet", letterName: "Gimel", pathNumber: 13 },
  { from: "chokmah", to: "binah", letterName: "Daleth", pathNumber: 14 },
  { from: "chokmah", to: "chesed", letterName: "Vav", pathNumber: 16 },
  { from: "chokmah", to: "tiferet", letterName: "Heh", pathNumber: 15 },
  { from: "binah", to: "gevurah", letterName: "Cheth", pathNumber: 18 },
  { from: "binah", to: "tiferet", letterName: "Zayin", pathNumber: 17 },
  { from: "chesed", to: "gevurah", letterName: "Teth", pathNumber: 19 },
  { from: "chesed", to: "tiferet", letterName: "Yod", pathNumber: 20 },
  { from: "chesed", to: "netzach", letterName: "Kaph", pathNumber: 21 },
  { from: "gevurah", to: "tiferet", letterName: "Lamed", pathNumber: 22 },
  { from: "gevurah", to: "hod", letterName: "Mem", pathNumber: 23 },
  { from: "tiferet", to: "netzach", letterName: "Nun", pathNumber: 24 },
  { from: "tiferet", to: "hod", letterName: "Ayin", pathNumber: 26 },
  { from: "tiferet", to: "yesod", letterName: "Samekh", pathNumber: 25 },
  { from: "netzach", to: "hod", letterName: "Peh", pathNumber: 27 },
  { from: "netzach", to: "yesod", letterName: "Tzaddi", pathNumber: 28 },
  { from: "netzach", to: "malkuth", letterName: "Qoph", pathNumber: 29 },
  { from: "hod", to: "yesod", letterName: "Resh", pathNumber: 30 },
  { from: "hod", to: "malkuth", letterName: "Shin", pathNumber: 31 },
  { from: "yesod", to: "malkuth", letterName: "Tav", pathNumber: 32 },
];

const PATH_EDGES: GraphEdge[] = PATHS.map(
  ({ from, to, letterName, pathNumber }): GraphEdge => ({
    id: `${from}-${to}`,
    endpoints: [from, to],
    attributions: edgeAttributions(letterName, pathNumber),
  }),
);

/**
 * Build the canonical Tree of Life.
 *
 * @returns a fresh, independent deep clone every call, so mutating the
 *   rendered/edited graph never touches this template
 */
export function createTreeOfLife(): GraphData {
  return {
    nodes: SEPHIROT.map((node) => ({
      ...node,
      position: { ...node.position },
      attributions: node.attributions ? { ...node.attributions } : undefined,
    })),
    edges: PATH_EDGES.map(
      (edge): GraphEdge => ({
        id: edge.id,
        endpoints: [edge.endpoints[0], edge.endpoints[1]],
        attributions: edge.attributions ? { ...edge.attributions } : undefined,
      }),
    ),
  };
}
