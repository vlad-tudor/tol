import { type Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { Group } from "three";

import { DEFAULT_COLOUR_SCHEME } from "~/graph/colourSchemes";
import { createTreeOfLife } from "~/graph/treeOfLife";
import type { GraphData } from "~/graph/types";
import { applyColours, applyLabels, createGraphObject } from "~/three/graphMesh";
import { SceneController } from "~/three/SceneController";

interface SceneProps {
  nodeKeys: Accessor<Set<string>>;
  edgeKeys: Accessor<Set<string>>;
}

/**
 * Solid host for the three.js scene. Mounts the stage and the graph geometry,
 * then keeps the labels in sync with the visibility signals via an effect —
 * the reactive → imperative bridge.
 */
export function Scene(props: SceneProps) {
  let host!: HTMLDivElement;
  const [rendered, setRendered] = createSignal<{ group: Group; graph: GraphData }>();

  onMount(() => {
    const controller = new SceneController(host);
    const graph = createTreeOfLife();
    const group = createGraphObject(graph);
    applyColours(group, graph, DEFAULT_COLOUR_SCHEME);
    controller.add(group);
    controller.start();
    setRendered({ group, graph });
    onCleanup(() => controller.dispose());
  });

  createEffect(() => {
    const state = rendered();
    if (!state) return;
    applyLabels(state.group, state.graph, props.nodeKeys(), props.edgeKeys());
  });

  return <div class="scene" ref={host} />;
}
