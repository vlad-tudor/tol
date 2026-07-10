import { SEPHIROT } from "~/graph/sephirot";
import {
  EdgeAttributionKey,
  type GraphData,
  type GraphEdge,
  type GraphNode,
  NodeAttributionKey,
  type Sephira,
  type TreeVariant,
  type VariantPath,
} from "~/graph/types";
import { DEFAULT_VARIANT } from "~/graph/variants";

/** Derive the render node (with display attributions) for a sephira. */
function sephiraToNode(sephira: Sephira): GraphNode {
  return {
    id: sephira.id,
    pillar: sephira.pillar,
    position: { ...sephira.position },
    attributions: {
      [NodeAttributionKey.Name]: sephira.names.latin,
      [NodeAttributionKey.Number]: String(sephira.number),
      [NodeAttributionKey.Hebrew]: sephira.names.hebrew,
    },
  };
}

/** Derive the render edge (id + display attributions) for a variant path. */
function pathToEdge(path: VariantPath): GraphEdge {
  const [from, to] = path.endpoints;
  return {
    id: `${from}-${to}`,
    endpoints: [from, to],
    attributions: {
      [EdgeAttributionKey.LetterName]: path.letter.name,
      [EdgeAttributionKey.PathNumber]: String(path.letter.number),
      [EdgeAttributionKey.HebrewLetter]: path.letter.hebrew,
    },
  };
}

/**
 * Compose the render graph for a structural variant: the shared sephirot as
 * nodes, the variant's paths as edges.
 *
 * @param variant - the structural variant to build
 * @returns a fresh, independent {@link GraphData} each call, so mutating the
 *   rendered/edited graph never touches the source data
 */
export function buildGraph(variant: TreeVariant): GraphData {
  return {
    nodes: SEPHIROT.map(sephiraToNode),
    edges: variant.paths.map(pathToEdge),
  };
}

/** The default tree — the Kircher variant. */
export function createTreeOfLife(): GraphData {
  return buildGraph(DEFAULT_VARIANT);
}
