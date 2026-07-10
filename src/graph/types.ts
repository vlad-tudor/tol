/** A point in 3D space. Plain data — deliberately free of any three.js type. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * The three vertical columns of the classical Tree of Life. Defined as a const
 * so call sites read `PillarPosition.Left`, with the {@link Pillar} type derived
 * from it — the values and the type share one source and can never drift apart.
 */
export const PillarPosition = {
  Left: "left",
  Middle: "middle",
  Right: "right",
} as const;

export type Pillar = (typeof PillarPosition)[keyof typeof PillarPosition];

/**
 * A set of named display texts attached to a node or edge — its name, its
 * number, a Hebrew letter, and so on, keyed by attribution category. Additive:
 * any subset can be shown at once, driven by which categories the UI toggles on.
 */
export type Attributions = Record<string, string>;

/** The attribution categories a node can carry. */
export const NodeAttributionKey = {
  Name: "name",
  Number: "number",
  Hebrew: "hebrew",
} as const;

export type NodeAttributionKey =
  (typeof NodeAttributionKey)[keyof typeof NodeAttributionKey];

/** The attribution categories an edge (path) can carry. */
export const EdgeAttributionKey = {
  LetterName: "letterName",
  PathNumber: "pathNumber",
  HebrewLetter: "hebrewLetter",
} as const;

export type EdgeAttributionKey =
  (typeof EdgeAttributionKey)[keyof typeof EdgeAttributionKey];

/** A sephira: a node on one of the pillars, with its display attributions. */
export interface GraphNode {
  id: string;
  pillar: Pillar;
  position: Vec3;
  attributions?: Attributions;
}

/**
 * A path between two nodes. `endpoints` is an *unordered* pair of node ids —
 * paths on the Tree of Life have no direction, so there is no source/target.
 * The object wrapper carries the id and the attributions.
 */
export interface GraphEdge {
  id: string;
  endpoints: [string, string];
  attributions?: Attributions;
}

/** A whole graph: its nodes and the edges between them. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Sources the render graph is composed from -----------------------------
// GraphData above is the render contract. The types below are the *authoring*
// model: a stable sephirot core, structural variants that supply the paths, and
// colour schemes that style the result — three orthogonal axes of flexibility.

/** A Hebrew letter and its path number — the identity a path carries. */
export interface Letter {
  name: string; // transliteration, e.g. "Aleph"
  hebrew: string; // glyph, e.g. "א"
  number: number; // path number, 11..32
}

/** A sephira — constant across every structural variant and colour scheme. */
export interface Sephira {
  id: string;
  number: number; // 1..10
  pillar: Pillar;
  position: Vec3;
  names: { latin: string; hebrew: string };
}

/** A path in a variant: the two sephirot it joins and the letter it carries. */
export interface VariantPath {
  endpoints: [string, string];
  letter: Letter;
}

/** A structural variant of the tree — a named set of paths over the sephirot. */
export interface TreeVariant {
  id: string;
  name: string;
  paths: VariantPath[];
}

/**
 * A colour scheme: colour overrides for sephirot (keyed by sephira id) and
 * paths (keyed by letter name — colour follows the letter, so a scheme is
 * independent of which variant is showing). Missing entries fall back to the
 * palette defaults, so the "Default" scheme is simply empty.
 */
export interface ColourScheme {
  id: string;
  name: string;
  sephira: Record<string, number>;
  path: Record<string, number>;
  /** The "ink" scheme: render spheres and paths white with a dark border. */
  neutral?: boolean;
}
