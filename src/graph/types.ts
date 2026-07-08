/** A point in 3D space. Plain data — deliberately free of any three.js type. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** The three vertical columns of the classical Tree of Life. */
export type Pillar = "left" | "middle" | "right";

/** A sephira: a labelled node sitting at a position on one of the pillars. */
export interface GraphNode {
  id: string;
  label: string;
  pillar: Pillar;
  position: Vec3;
}

/** A path: an undirected connection between two nodes, referenced by id. */
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

/** A whole graph: its nodes and the edges between them. */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
