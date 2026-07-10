import { type Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { Group } from "three";

import { createTreeOfLife } from "~/graph/treeOfLife";
import type { ColourScheme, GraphData } from "~/graph/types";
import { applyColours, applyLabels, createGraphObject } from "~/three/graphMesh";
import { SceneController } from "~/three/SceneController";

interface SceneProps {
  nodeKeys: Accessor<Set<string>>;
  edgeKeys: Accessor<Set<string>>;
  scheme: Accessor<ColourScheme>;
}

/**
 * Solid host for the three.js scene. Mounts the stage and the graph geometry,
 * then keeps labels and colours in sync with their signals via effects — the
 * reactive → imperative bridge.
 */
export function Scene(props: SceneProps) {
  let host!: HTMLDivElement;
  const [rendered, setRendered] = createSignal<{ group: Group; graph: GraphData }>();

  onMount(() => {
    const controller = new SceneController(host);
    const graph = createTreeOfLife();
    const group = createGraphObject(graph);
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

  createEffect(() => {
    const state = rendered();
    if (!state) return;
    applyColours(state.group, state.graph, props.scheme());
  });

  return <div class="scene" ref={host} />;
}
