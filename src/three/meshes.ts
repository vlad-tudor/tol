import {
  LineCurve3,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";

import type { Vec3 } from "~/graph/types";
import { palette } from "~/theme/palette";

const SPHERE_RADIUS = 0.5;
const SPHERE_SEGMENTS = 32;
const SPHERE_ROUGHNESS = 0.4;
const SPHERE_METALNESS = 0.1;

const TUBE_RADIUS = 0.08;
const TUBE_RADIAL_SEGMENTS = 8;
const TUBE_PATH_SEGMENTS = 1; // a straight span needs only one segment
const TUBE_ROUGHNESS = 0.6;

/**
 * Build the sphere mesh for a node.
 *
 * @param position - where to centre the sphere
 * @returns a `Mesh` of `SphereGeometry` + a `MeshStandardMaterial` in the node
 *   palette colour, translated to `position`; it owns its geometry and material
 */
export function createSphere(position: Vec3): Mesh {
  const geometry = new SphereGeometry(
    SPHERE_RADIUS,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
  );
  const material = new MeshStandardMaterial({
    color: palette.node,
    emissive: palette.nodeEmissive,
    roughness: SPHERE_ROUGHNESS,
    metalness: SPHERE_METALNESS,
  });
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
 * @returns a `Mesh` of {@link createTubeGeometry} + a `MeshStandardMaterial` in
 *   the edge palette colour; it owns its geometry and material
 */
export function createTube(from: Vec3, to: Vec3): Mesh {
  const material = new MeshStandardMaterial({
    color: palette.edge,
    emissive: palette.edgeEmissive,
    roughness: TUBE_ROUGHNESS,
  });
  return new Mesh(createTubeGeometry(from, to), material);
}
