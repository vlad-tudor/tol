import {
  BackSide,
  LineCurve3,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";

import type { Vec3 } from "~/graph/types";
import { palette } from "~/theme/palette";

// Geometry proportions for the tree. Material tuning (roughness, env-map,
// emissive) is per-style and applied by applyColours, not baked here.
const SPHERE_RADIUS = 1;
const SPHERE_SEGMENTS = 48;

const TUBE_RADIUS = 0.2;
const TUBE_RADIAL_SEGMENTS = 16;
const TUBE_PATH_SEGMENTS = 1; // a straight span needs only one segment

const OUTLINE_SCALE = 1.05; // inverted-hull radius multiple — a thin contour

/**
 * Build the sphere mesh for a node.
 *
 * @param position - where to centre the sphere
 * @returns a `Mesh` of `SphereGeometry` + a `MeshStandardMaterial`; applyColours
 *   sets its colour, emissive, roughness, and env-map from the active style. It
 *   owns its geometry and material.
 */
export function createSphere(position: Vec3): Mesh {
  const geometry = new SphereGeometry(
    SPHERE_RADIUS,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
  );
  const material = new MeshStandardMaterial({ color: palette.node, metalness: 0 });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  return mesh;
}

/**
 * Build the straight tube geometry spanning two points. Modelling it as a
 * {@link TubeGeometry} over a {@link LineCurve3} means the endpoints go in
 * directly — no orientation maths.
 *
 * @param from - one end of the tube
 * @param to - the other end
 * @returns a `TubeGeometry` following the straight line from `from` to `to`
 */
export function createTubeGeometry(from: Vec3, to: Vec3): TubeGeometry {
  const curve = new LineCurve3(
    new Vector3(from.x, from.y, from.z),
    new Vector3(to.x, to.y, to.z),
  );
  return new TubeGeometry(
    curve,
    TUBE_PATH_SEGMENTS,
    TUBE_RADIUS,
    TUBE_RADIAL_SEGMENTS,
    false,
  );
}

/**
 * Build the tube mesh for an edge.
 *
 * @param from - one end of the tube
 * @param to - the other end
 * @returns a `Mesh` of {@link createTubeGeometry} + a `MeshStandardMaterial`;
 *   applyColours styles it. It owns its geometry and material.
 */
export function createTube(from: Vec3, to: Vec3): Mesh {
  const material = new MeshStandardMaterial({ color: palette.edge, metalness: 0 });
  return new Mesh(createTubeGeometry(from, to), material);
}

/**
 * Build a sphere's halo — an inverted hull that reads as a thin contour line
 * around the silhouette from any angle.
 *
 * @param colour - the contour colour (gold on dark styles, sepia on light)
 * @returns a slightly larger back-facing `Mesh` to parent to a sphere
 */
export function createNodeOutline(colour: number): Mesh {
  const geometry = new SphereGeometry(
    SPHERE_RADIUS * OUTLINE_SCALE,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
  );
  const material = new MeshBasicMaterial({ color: colour, side: BackSide });
  material.toneMapped = false;
  return new Mesh(geometry, material);
}
