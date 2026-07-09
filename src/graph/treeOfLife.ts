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
const PILLAR_OFFSET = 2.8; // ±X distance of the side pillars from the centre
const CENTRAL_DEPTH = 0.6; // +Z, toward the viewer — the middle pillar leans forward
const SIDE_DEPTH = -0.6; // -Z, away from the viewer — the side pillars lean back
const LAYOUT_SCALE = 1.3; // overall spread of the X/Y layout — the gap between spheres (Z depth left as tuned)

function nodeAttributions(
  name: string,
  number: number,
  hebrew: string,
): Attributions {
  return {
    [NodeAttributionKey.Name]: name,
    [NodeAttributionKey.Number]: String(number),
    [NodeAttributionKey.Hebrew]: hebrew,
  };
}

function edgeAttributions(
  letterName: string,
  pathNumber: number,
  hebrewLetter: string,
): Attributions {
  return {
    [EdgeAttributionKey.LetterName]: letterName,
    [EdgeAttributionKey.PathNumber]: String(pathNumber),
    [EdgeAttributionKey.HebrewLetter]: hebrewLetter,
  };
}

// Positions are centred on the origin so the figure frames itself under the
// default camera target. Left pillar x < 0, right pillar x > 0, middle at 0.
const SEPHIROT: GraphNode[] = [
  { id: "keter", pillar: PillarPosition.Middle, position: { x: 0, y: 5, z: 0 }, attributions: nodeAttributions("Keter", 1, "כתר") },
  { id: "chokmah", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: 3.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Chokmah", 2, "חכמה") },
  { id: "binah", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: 3.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Binah", 3, "בינה") },
  { id: "chesed", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: 1.2, z: SIDE_DEPTH }, attributions: nodeAttributions("Chesed", 4, "חסד") },
  { id: "gevurah", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: 1.2, z: SIDE_DEPTH }, attributions: nodeAttributions("Gevurah", 5, "גבורה") },
  { id: "tiferet", pillar: PillarPosition.Middle, position: { x: 0, y: 0, z: CENTRAL_DEPTH }, attributions: nodeAttributions("Tiferet", 6, "תפארת") },
  { id: "netzach", pillar: PillarPosition.Right, position: { x: PILLAR_OFFSET, y: -1.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Netzach", 7, "נצח") },
  { id: "hod", pillar: PillarPosition.Left, position: { x: -PILLAR_OFFSET, y: -1.6, z: SIDE_DEPTH }, attributions: nodeAttributions("Hod", 8, "הוד") },
  { id: "yesod", pillar: PillarPosition.Middle, position: { x: 0, y: -3.2, z: CENTRAL_DEPTH }, attributions: nodeAttributions("Yesod", 9, "יסוד") },
  { id: "malkuth", pillar: PillarPosition.Middle, position: { x: 0, y: -5.8, z: 0 }, attributions: nodeAttributions("Malkuth", 10, "מלכות") },
];

// The twenty-two paths, as unordered node-id pairs with their letter, number,
// and Hebrew-letter attributions. Edge ids are derived from the endpoints so
// the two representations can never drift apart.
const PATHS: ReadonlyArray<{
  from: string;
  to: string;
  letterName: string;
  pathNumber: number;
  hebrewLetter: string;
}> = [
  { from: "keter", to: "chokmah", letterName: "Aleph", pathNumber: 11, hebrewLetter: "א" },
  { from: "keter", to: "binah", letterName: "Beth", pathNumber: 12, hebrewLetter: "ב" },
  { from: "keter", to: "tiferet", letterName: "Gimel", pathNumber: 13, hebrewLetter: "ג" },
  { from: "chokmah", to: "binah", letterName: "Daleth", pathNumber: 14, hebrewLetter: "ד" },
  { from: "chokmah", to: "chesed", letterName: "Vav", pathNumber: 16, hebrewLetter: "ו" },
  { from: "chokmah", to: "tiferet", letterName: "Heh", pathNumber: 15, hebrewLetter: "ה" },
  { from: "binah", to: "gevurah", letterName: "Cheth", pathNumber: 18, hebrewLetter: "ח" },
  { from: "binah", to: "tiferet", letterName: "Zayin", pathNumber: 17, hebrewLetter: "ז" },
  { from: "chesed", to: "gevurah", letterName: "Teth", pathNumber: 19, hebrewLetter: "ט" },
  { from: "chesed", to: "tiferet", letterName: "Yod", pathNumber: 20, hebrewLetter: "י" },
  { from: "chesed", to: "netzach", letterName: "Kaph", pathNumber: 21, hebrewLetter: "כ" },
  { from: "gevurah", to: "tiferet", letterName: "Lamed", pathNumber: 22, hebrewLetter: "ל" },
  { from: "gevurah", to: "hod", letterName: "Mem", pathNumber: 23, hebrewLetter: "מ" },
  { from: "tiferet", to: "netzach", letterName: "Nun", pathNumber: 24, hebrewLetter: "נ" },
  { from: "tiferet", to: "hod", letterName: "Ayin", pathNumber: 26, hebrewLetter: "ע" },
  { from: "tiferet", to: "yesod", letterName: "Samekh", pathNumber: 25, hebrewLetter: "ס" },
  { from: "netzach", to: "hod", letterName: "Peh", pathNumber: 27, hebrewLetter: "פ" },
  { from: "netzach", to: "yesod", letterName: "Tzaddi", pathNumber: 28, hebrewLetter: "צ" },
  { from: "netzach", to: "malkuth", letterName: "Qoph", pathNumber: 29, hebrewLetter: "ק" },
  { from: "hod", to: "yesod", letterName: "Resh", pathNumber: 30, hebrewLetter: "ר" },
  { from: "hod", to: "malkuth", letterName: "Shin", pathNumber: 31, hebrewLetter: "ש" },
  { from: "yesod", to: "malkuth", letterName: "Tav", pathNumber: 32, hebrewLetter: "ת" },
];

const PATH_EDGES: GraphEdge[] = PATHS.map(
  ({ from, to, letterName, pathNumber, hebrewLetter }): GraphEdge => ({
    id: `${from}-${to}`,
    endpoints: [from, to],
    attributions: edgeAttributions(letterName, pathNumber, hebrewLetter),
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
      position: {
        x: node.position.x * LAYOUT_SCALE,
        y: node.position.y * LAYOUT_SCALE,
        z: node.position.z,
      },
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
