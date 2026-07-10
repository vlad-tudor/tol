import {
  Group,
  type Material,
  Mesh,
  type MeshStandardMaterial,
  type Object3D,
  Sprite,
} from "three";

import { nodesById } from "~/graph/graph";
import {
  type Attributions,
  type ColourScheme,
  EdgeAttributionKey,
  type GraphData,
} from "~/graph/types";
import { luminance } from "~/theme/colour";
import { createLabel, type LabelStyle } from "~/three/label";
import { createNodeOutline, createSphere, createTube } from "~/three/meshes";
import type { MaterialSpec, SceneStyle } from "~/three/styles";
import { palette } from "~/theme/palette";

const INITIAL_ROTATION = 0.4; // radians (~23°) — a slight spawn tilt on X and Y to reveal the depth

const NODE_LABEL_WORLD_HEIGHT = 0.42;
const EDGE_LABEL_WORLD_HEIGHT = 0.34;
const LABEL_OUTLINE_WIDTH = 0.13; // stroke width as a fraction of the font size
// Below this luminance a sphere is "dark", so its label flips to light ink.
const DARK_SPHERE_LUMINANCE = 120;

/**
 * Build the geometry of a graph: one sphere per node, one tube per edge, all
 * parented under a single Group. Colours, labels, and the halo are applied
 * afterwards by {@link applyColours}, {@link applyLabels}, and
 * {@link applyNodeOutline}.
 *
 * @param graph - the graph to render
 * @returns a Group holding a sphere for every node and a tube for every edge;
 *   each mesh carries its id as `name`, so the apply-\* passes find it
 */
export function createGraphObject(graph: GraphData): Group {
  const group = new Group();
  group.rotation.x = INITIAL_ROTATION;
  group.rotation.y = INITIAL_ROTATION;
  const nodeIndex = nodesById(graph);

  for (const node of graph.nodes) {
    const sphere = createSphere(node.position);
    sphere.name = node.id;
    group.add(sphere);
  }

  for (const edge of graph.edges) {
    const [fromId, toId] = edge.endpoints;
    const from = nodeIndex.get(fromId);
    const to = nodeIndex.get(toId);
    if (!from || !to) continue;

    const tube = createTube(from.position, to.position);
    tube.name = edge.id;
    group.add(tube);
  }

  return group;
}

/**
 * Colour and material-tune a graph's meshes from a scheme and style. Sephira
 * colours key by node id, path colours by letter name; each material's emissive
 * is tinted from its own colour, and roughness / env-map / emissive strength
 * come from the style.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param scheme - the colour scheme to apply
 * @param style - the active scene style (material tuning)
 */
export function applyColours(
  group: Group,
  graph: GraphData,
  scheme: ColourScheme,
  style: SceneStyle,
): void {
  const meshById = new Map(group.children.map((child) => [child.name, child]));

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!(mesh instanceof Mesh)) continue;
    paintMesh(mesh, scheme.sephira[node.id] ?? palette.node, style.node);
  }

  for (const edge of graph.edges) {
    const mesh = meshById.get(edge.id);
    if (!(mesh instanceof Mesh)) continue;
    const letter = edge.attributions?.[EdgeAttributionKey.LetterName];
    const colour = (letter ? scheme.path[letter] : undefined) ?? palette.edge;
    paintMesh(mesh, colour, style.tube);
  }
}

/**
 * (Re)build the labels on a graph's meshes for the visible attributions. Node
 * ink adapts to the sphere's own colour; path ink adapts to the background
 * (light vs dark) so both stay legible. Idempotent.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param nodeKeys - the node attribution categories to show
 * @param edgeKeys - the edge attribution categories to show
 * @param scheme - the active colour scheme (drives adaptive node ink)
 * @param style - the active scene style (drives adaptive path ink)
 */
export function applyLabels(
  group: Group,
  graph: GraphData,
  nodeKeys: ReadonlySet<string>,
  edgeKeys: ReadonlySet<string>,
  scheme: ColourScheme,
  style: SceneStyle,
): void {
  const meshById = new Map(group.children.map((child) => [child.name, child]));
  const nodeIndex = nodesById(graph);

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!mesh) continue;
    const lines = visibleLines(node.attributions, nodeKeys);
    const colour = scheme.sephira[node.id] ?? palette.node;
    setLabel(mesh, lines, nodeLabelStyle(colour), (label) => {
      label.position.set(0, 0, 0); // centred on the sphere
    });
  }

  for (const edge of graph.edges) {
    const mesh = meshById.get(edge.id);
    const [fromId, toId] = edge.endpoints;
    const from = nodeIndex.get(fromId);
    const to = nodeIndex.get(toId);
    if (!mesh || !from || !to) continue;
    const lines = visibleLines(edge.attributions, edgeKeys);
    setLabel(mesh, lines, edgeLabelStyle(style.lightBg), (label) => {
      // The tube sits at the origin (its geometry holds world coords), so a
      // world-space midpoint is the label's local position.
      label.position.set(
        (from.position.x + to.position.x) / 2,
        (from.position.y + to.position.y) / 2,
        (from.position.z + to.position.z) / 2,
      );
    });
  }
}

/**
 * Add or remove each sphere's halo (an inverted-hull contour child).
 * Idempotent — call it again to change the colour or turn it off.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param enabled - whether the halo is shown
 * @param colour - the contour colour (from the active style)
 */
export function applyNodeOutline(
  group: Group,
  graph: GraphData,
  enabled: boolean,
  colour: number,
): void {
  const meshById = new Map(group.children.map((child) => [child.name, child]));

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!(mesh instanceof Mesh)) continue;

    // The halo is the sphere's only Mesh child (labels are Sprites).
    for (const child of [...mesh.children]) {
      if (child instanceof Mesh) {
        mesh.remove(child);
        child.geometry.dispose();
        (child.material as Material).dispose();
      }
    }
    if (enabled) mesh.add(createNodeOutline(colour));
  }
}

/** Set a mesh's base colour, own-tinted emissive, roughness, and env-map. */
function paintMesh(mesh: Mesh, colour: number, spec: MaterialSpec): void {
  const material = mesh.material as MeshStandardMaterial;
  material.color.setHex(colour);
  material.emissive.setHex(colour);
  material.emissiveIntensity = spec.emissiveIntensity;
  material.roughness = spec.roughness;
  material.envMapIntensity = spec.envMapIntensity;
}

/** Node label style: light ink on dark spheres, dark ink on light ones. */
function nodeLabelStyle(colour: number): LabelStyle {
  const dark = luminance(colour) < DARK_SPHERE_LUMINANCE;
  return {
    color: dark ? palette.labelInkLight : palette.labelInkDark,
    lineWorldHeight: NODE_LABEL_WORLD_HEIGHT,
    outline: {
      color: dark ? palette.labelContourDark : palette.labelInkLight,
      width: LABEL_OUTLINE_WIDTH,
    },
  };
}

/** Path label style: dark ink on a light background, light ink on a dark one. */
function edgeLabelStyle(lightBg: boolean): LabelStyle {
  return {
    color: lightBg ? palette.edgeLabelInkLight : palette.edgeLabelInk,
    lineWorldHeight: EDGE_LABEL_WORLD_HEIGHT,
    outline: {
      color: lightBg ? palette.edgeLabelContourLight : palette.edgeLabelContour,
      width: LABEL_OUTLINE_WIDTH,
    },
  };
}

/** The visible attribution values, in the attributions' own category order. */
function visibleLines(
  attributions: Attributions | undefined,
  keys: ReadonlySet<string>,
): string[] {
  if (!attributions) return [];
  return Object.entries(attributions)
    .filter(([key]) => keys.has(key))
    .map(([, value]) => value);
}

/** Replace a mesh's label sprite with a fresh one for `lines` (or none). */
function setLabel(
  mesh: Object3D,
  lines: string[],
  style: LabelStyle,
  place: (label: Sprite) => void,
): void {
  for (const child of [...mesh.children]) {
    if (child instanceof Sprite) {
      mesh.remove(child);
      child.material.map?.dispose();
      child.material.dispose();
    }
  }
  if (lines.length === 0) return;

  const label = createLabel(lines, style);
  place(label);
  mesh.add(label);
}
