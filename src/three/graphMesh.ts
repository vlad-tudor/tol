import {
  Group,
  type Material,
  Mesh,
  type MeshBasicMaterial,
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
  type GraphEdge,
  type GraphNode,
} from "~/graph/types";
import { luminance } from "~/theme/colour";
import { createLabel, type LabelStyle } from "~/three/label";
import {
  createNodeOutline,
  createSphere,
  createTube,
  createTubeBorder,
} from "~/three/meshes";
import type { MaterialSpec, SceneStyle } from "~/three/styles";
import { palette } from "~/theme/palette";

const INITIAL_ROTATION = 0.4; // radians (~23°) — a slight spawn tilt on X and Y to reveal the depth

const NODE_LABEL_WORLD_HEIGHT = 0.42;
const EDGE_LABEL_WORLD_HEIGHT = 0.34;
const LABEL_OUTLINE_WIDTH = 0.13; // stroke width as a fraction of the font size
// Below this luminance a fill is "dark", so its label flips to light ink.
const DARK_FILL_LUMINANCE = 120;

/**
 * Build the geometry of a graph: one sphere per node, one tube (with a border)
 * per edge, all parented under a single Group. Colours, labels, and the halo
 * are applied afterwards by {@link applyColours}, {@link applyLabels}, and
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
    // Shown only in the neutral scheme; colour set by applyColours.
    tube.add(createTubeBorder(from.position, to.position, palette.void));
    group.add(tube);
  }

  return group;
}

/** The rendered colour of a sephira: the style's ink white in the neutral scheme, else the scheme colour. */
function nodeFill(node: GraphNode, scheme: ColourScheme, style: SceneStyle): number {
  if (scheme.neutral) return style.pathFill;
  return scheme.sephira[node.id] ?? palette.node;
}

/** The rendered colour of a path: the style's ink white in the neutral scheme, else the scheme colour by letter. */
function edgeFill(edge: GraphEdge, scheme: ColourScheme, style: SceneStyle): number {
  if (scheme.neutral) return style.pathFill;
  const letter = edge.attributions?.[EdgeAttributionKey.LetterName];
  return (letter ? scheme.path[letter] : undefined) ?? palette.edge;
}

/**
 * Colour and material-tune a graph's meshes for a scheme and style. The neutral
 * scheme renders spheres and paths in the style's ink white with the path
 * border shown; any other scheme colours them and hides the border. Each
 * material's emissive is tinted from its own colour.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param scheme - the active colour scheme
 * @param style - the active scene style (ink colours + material tuning)
 */
export function applyColours(
  group: Group,
  graph: GraphData,
  scheme: ColourScheme,
  style: SceneStyle,
): void {
  const meshById = new Map(group.children.map((child) => [child.name, child]));
  const borderShown = scheme.neutral ?? false;

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!(mesh instanceof Mesh)) continue;
    paintMesh(mesh, nodeFill(node, scheme, style), style.node);
  }

  for (const edge of graph.edges) {
    const mesh = meshById.get(edge.id);
    if (!(mesh instanceof Mesh)) continue;
    paintMesh(mesh, edgeFill(edge, scheme, style), style.tube);

    const border = mesh.children.find((child) => child instanceof Mesh) as
      | Mesh
      | undefined;
    if (border) {
      border.visible = borderShown;
      (border.material as MeshBasicMaterial).color.setHex(style.pathBorder);
    }
  }
}

/**
 * (Re)build the labels on a graph's meshes for the visible attributions. Ink
 * adapts to whatever it sits on — the rendered sphere or path colour — so it
 * stays legible. Idempotent.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param nodeKeys - the node attribution categories to show
 * @param edgeKeys - the edge attribution categories to show
 * @param scheme - the active colour scheme
 * @param style - the active scene style
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
    const labelStyle = adaptiveLabelStyle(nodeFill(node, scheme, style), NODE_LABEL_WORLD_HEIGHT);
    setLabel(mesh, lines, labelStyle, (label) => {
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
    const labelStyle = adaptiveLabelStyle(edgeFill(edge, scheme, style), EDGE_LABEL_WORLD_HEIGHT);
    setLabel(mesh, lines, labelStyle, (label) => {
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
 * Set each sphere's halo (an inverted-hull contour child). It's forced on in the
 * neutral scheme (a dark ink outline), otherwise it follows `haloEnabled` (the
 * style's gold/sepia). Idempotent.
 *
 * @param group - a Group built by {@link createGraphObject}
 * @param graph - the graph the group was built from
 * @param scheme - the active colour scheme (neutral forces the outline on)
 * @param style - the active scene style (outline colour)
 * @param haloEnabled - the user's halo toggle (ignored when neutral)
 */
export function applyNodeOutline(
  group: Group,
  graph: GraphData,
  scheme: ColourScheme,
  style: SceneStyle,
  haloEnabled: boolean,
): void {
  const neutral = scheme.neutral ?? false;
  const enabled = neutral || haloEnabled;
  const colour = neutral ? style.pathBorder : style.nodeOutlineColour;
  const meshById = new Map(group.children.map((child) => [child.name, child]));

  for (const node of graph.nodes) {
    const mesh = meshById.get(node.id);
    if (!(mesh instanceof Mesh)) continue;

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

/** Label style that flips ink light/dark by the fill it sits on. */
function adaptiveLabelStyle(fill: number, lineWorldHeight: number): LabelStyle {
  const dark = luminance(fill) < DARK_FILL_LUMINANCE;
  return {
    color: dark ? palette.labelInkLight : palette.labelInkDark,
    lineWorldHeight,
    outline: {
      color: dark ? palette.labelContourDark : palette.labelInkLight,
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
