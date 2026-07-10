import { type Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { Group } from "three";

import { createTreeOfLife } from "~/graph/treeOfLife";
import type { ColourScheme, GraphData } from "~/graph/types";
import {
  applyColours,
  applyLabels,
  applyNodeOutline,
  createGraphObject,
} from "~/three/graphMesh";
import { SceneController } from "~/three/SceneController";
import type { SceneStyle } from "~/three/styles";

interface SceneProps {
  nodeKeys: Accessor<Set<string>>;
  edgeKeys: Accessor<Set<string>>;
  scheme: Accessor<ColourScheme>;
  style: Accessor<SceneStyle>;
  nodeOutline: Accessor<boolean>;
}

/**
 * Solid host for the three.js scene. Mounts the stage and the graph geometry,
 * then keeps the style, colours, labels, and halo in sync with their signals
 * via effects — the reactive → imperative bridge.
 */
export function Scene(props: SceneProps) {
  let host!: HTMLDivElement;
  const [rendered, setRendered] =
    createSignal<{ controller: SceneController; group: Group; graph: GraphData }>();

  onMount(() => {
    const controller = new SceneController(host);
    const graph = createTreeOfLife();
    const group = createGraphObject(graph);
    controller.add(group);

    // Apply the initial look before the first frame so nothing flashes.
    controller.setStyle(props.style());
    applyColours(group, graph, props.scheme(), props.style());
    applyLabels(group, graph, props.nodeKeys(), props.edgeKeys(), props.scheme(), props.style());
    applyNodeOutline(group, graph, props.scheme(), props.style(), props.nodeOutline());

    controller.start();
    setRendered({ controller, group, graph });
    onCleanup(() => controller.dispose());
  });

  createEffect(() => {
    const state = rendered();
    if (!state) return;
    state.controller.setStyle(props.style());
  });

  createEffect(() => {
    const state = rendered();
    if (!state) return;
    applyColours(state.group, state.graph, props.scheme(), props.style());
  });

  createEffect(() => {
    const state = rendered();
    if (!state) return;
    applyLabels(
      state.group,
      state.graph,
      props.nodeKeys(),
      props.edgeKeys(),
      props.scheme(),
      props.style(),
    );
  });

  createEffect(() => {
    const state = rendered();
    if (!state) return;
    applyNodeOutline(
      state.group,
      state.graph,
      props.scheme(),
      props.style(),
      props.nodeOutline(),
    );
  });

  return <div class="scene" ref={host} />;
}
