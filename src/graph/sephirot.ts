import { PillarPosition, type Sephira, type Vec3 } from "~/graph/types";

// Layout parameters, tuned by eye. Middle-pillar nodes sit at x = 0; the side
// pillars stand PILLAR_OFFSET to either side. Depth leans the central pillar
// forward (+Z) and the sides back (-Z); LAYOUT_SCALE spreads the whole X/Y
// layout — the gap between spheres. Keter and Malkuth stay at z = 0 as anchors.
const PILLAR_OFFSET = 2.8;
const CENTRAL_DEPTH = 0.6;
const SIDE_DEPTH = -0.6;
const LAYOUT_SCALE = 1.3;

/** Scale a base position into world space (X/Y spread; Z depth left as tuned). */
function pos(x: number, y: number, z: number): Vec3 {
  return { x: x * LAYOUT_SCALE, y: y * LAYOUT_SCALE, z };
}

/**
 * The ten sephirot — the stable core shared by every structural variant and
 * every colour scheme. Positions can be overridden per-variant later; for now
 * they live here and every variant uses them.
 */
export const SEPHIROT: Sephira[] = [
  { id: "keter", number: 1, pillar: PillarPosition.Middle, position: pos(0, 5, 0), names: { latin: "Keter", hebrew: "כתר" } },
  { id: "chokmah", number: 2, pillar: PillarPosition.Right, position: pos(PILLAR_OFFSET, 3.6, SIDE_DEPTH), names: { latin: "Chokmah", hebrew: "חכמה" } },
  { id: "binah", number: 3, pillar: PillarPosition.Left, position: pos(-PILLAR_OFFSET, 3.6, SIDE_DEPTH), names: { latin: "Binah", hebrew: "בינה" } },
  { id: "chesed", number: 4, pillar: PillarPosition.Right, position: pos(PILLAR_OFFSET, 1.2, SIDE_DEPTH), names: { latin: "Chesed", hebrew: "חסד" } },
  { id: "gevurah", number: 5, pillar: PillarPosition.Left, position: pos(-PILLAR_OFFSET, 1.2, SIDE_DEPTH), names: { latin: "Gevurah", hebrew: "גבורה" } },
  { id: "tiferet", number: 6, pillar: PillarPosition.Middle, position: pos(0, 0, CENTRAL_DEPTH), names: { latin: "Tiferet", hebrew: "תפארת" } },
  { id: "netzach", number: 7, pillar: PillarPosition.Right, position: pos(PILLAR_OFFSET, -1.6, SIDE_DEPTH), names: { latin: "Netzach", hebrew: "נצח" } },
  { id: "hod", number: 8, pillar: PillarPosition.Left, position: pos(-PILLAR_OFFSET, -1.6, SIDE_DEPTH), names: { latin: "Hod", hebrew: "הוד" } },
  { id: "yesod", number: 9, pillar: PillarPosition.Middle, position: pos(0, -3.2, CENTRAL_DEPTH), names: { latin: "Yesod", hebrew: "יסוד" } },
  { id: "malkuth", number: 10, pillar: PillarPosition.Middle, position: pos(0, -5.8, 0), names: { latin: "Malkuth", hebrew: "מלכות" } },
];
