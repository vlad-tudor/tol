import type { Vec3 } from "~/graph/types";

/** The lights that define a scene style's mood. */
export interface LightSpec {
  sky: number;
  ground: number;
  hemiIntensity: number;
  keyColour: number;
  keyIntensity: number;
  keyPosition: Vec3;
  fillColour: number;
  fillIntensity: number;
}

/** The per-style material tuning for a family of meshes (spheres or tubes). */
export interface MaterialSpec {
  roughness: number;
  envMapIntensity: number;
  /** Strength of the own-colour emissive — lower on light backgrounds. */
  emissiveIntensity: number;
}

/**
 * A rendering "look": backdrop, lighting, material tuning, and the contour
 * colour for the optional sphere halo. Geometry (radii, segments) and tone
 * mapping are shared across styles; only these differ.
 */
export interface SceneStyle {
  id: string;
  name: string;
  /** True for light backdrops — flips path-label ink and the halo to sepia. */
  lightBg: boolean;
  /** CSS radial-gradient set on the canvas host (the transparent canvas sits over it). */
  background: string;
  light: LightSpec;
  node: MaterialSpec;
  tube: MaterialSpec;
  nodeOutlineColour: number;
  /** Neutral path fill + border (paths are uncoloured until selection mode). */
  pathFill: number;
  pathBorder: number;
}

/** Moon — the cool, silvery dark default. */
export const MOON_STYLE: SceneStyle = {
  id: "moon",
  name: "Moon",
  lightBg: false,
  background:
    "radial-gradient(ellipse 96% 86% at 50% 42%, #12141f 0%, #0a0c14 55%, #040507 100%)",
  light: {
    sky: 0xdfeaff,
    ground: 0x232839,
    hemiIntensity: 1.2,
    keyColour: 0xcad8ff,
    keyIntensity: 0.75,
    keyPosition: { x: -2, y: 6, z: 7 },
    fillColour: 0xdfe8ff,
    fillIntensity: 0.14,
  },
  node: { roughness: 0.82, envMapIntensity: 0.32, emissiveIntensity: 0.24 },
  tube: { roughness: 0.85, envMapIntensity: 0.26, emissiveIntensity: 0.28 },
  nodeOutlineColour: 0xd8c48a, // gold leaf
  pathFill: 0xe6ebf5, // cool near-white
  pathBorder: 0x1a1e2a, // soft dark edge, legible on the dark backdrop
};

/** Parchment — warm illuminated-manuscript light backdrop. */
export const PARCHMENT_STYLE: SceneStyle = {
  id: "parchment",
  name: "Parchment",
  lightBg: true,
  background:
    "radial-gradient(ellipse 100% 92% at 50% 40%, #f3e9d2 0%, #e7d8b6 55%, #d6c199 100%)",
  light: {
    sky: 0xfff6e6,
    ground: 0xcbb489, // warm bounce into the spheres' undersides, like light off the page
    hemiIntensity: 1.35,
    keyColour: 0xfff4dc,
    keyIntensity: 0.85,
    keyPosition: { x: 3, y: 6, z: 7 },
    fillColour: 0xffffff,
    fillIntensity: 0.1,
  },
  // Low emissive so diffuse shading gives each sphere form against the bright paper.
  node: { roughness: 0.85, envMapIntensity: 0.25, emissiveIntensity: 0.1 },
  tube: { roughness: 0.85, envMapIntensity: 0.22, emissiveIntensity: 0.14 },
  nodeOutlineColour: 0x5c4f30, // sepia ink
  pathFill: 0xfaf5e9, // warm white
  pathBorder: 0x1c160c, // near-black ink on the pale paper
};

/** All available scene styles. */
export const SCENE_STYLES: SceneStyle[] = [MOON_STYLE, PARCHMENT_STYLE];

/** The style shown on load. */
export const DEFAULT_STYLE = MOON_STYLE;
