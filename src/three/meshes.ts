import {
  LineCurve3,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";

import type { Vec3 } from "~/graph/types";

const SPHERE_RADIUS = 0.5;
const SPHERE_SEGMENTS = 32;
const TUBE_RADIUS = 0.08;
const TUBE_RADIAL_SEGMENTS = 8;
const TUBE_PATH_SEGMENTS = 1; // a straight span needs only one segment

/** Build a sphere mesh centred at a point. */
export function createSphere(position: Vec3): Mesh {
  const geometry = new SphereGeometry(
    SPHERE_RADIUS,
    SPHERE_SEGMENTS,
    SPHERE_SEGMENTS,
  );
  const material = new MeshStandardMaterial({
    color: 0xf4e8c1,
    emissive: 0x2a2410,
    roughness: 0.4,
    metalness: 0.1,
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  return mesh;
}

/**
 * Build the straight tube geometry spanning two points. Modelling it as a
 * {@link TubeGeometry} over a {@link LineCurve3} means the endpoints go in
 * directly — no orientation maths.
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

/** Build a tube mesh spanning two points. */
export function createTube(from: Vec3, to: Vec3): Mesh {
  const material = new MeshStandardMaterial({
    color: 0x8a7fbf,
    emissive: 0x141024,
    roughness: 0.6,
  });
  return new Mesh(createTubeGeometry(from, to), material);
}
