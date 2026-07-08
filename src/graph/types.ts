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

/** A sephira: a labelled node sitting at a position on one of the pillars. */
export interface GraphNode {
  id: string;
  label: string;
  pillar: Pillar;
  position: Vec3;
}

/**
 * A path between two nodes. `endpoints` is an *unordered* pair of node ids —
 * paths on the Tree of Life have no direction, so there is no source/target.
 * The object wrapper carries the id and leaves room for future per-edge
 * metadata (Hebrew letter, Tarot attribution, colour scales).
 */
export interface GraphEdge {
  id: string;
  endpoints: [string, string];
}

/** A whole graph: its nodes and the edges between them. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
