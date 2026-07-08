import { onCleanup, onMount } from "solid-js";

import { createTreeOfLife } from "~/graph/treeOfLife";
import { createGraphObject } from "~/three/graphMesh";
import { SceneController } from "~/three/SceneController";

/**
 * Solid host for the three.js scene. Owns the mount element's lifecycle, builds
 * the Tree of Life's meshes, and hands them to the {@link SceneController} stage
 * through its public seam.
 */
export function Scene() {
  let host!: HTMLDivElement;

  onMount(() => {
    const controller = new SceneController(host);
    controller.add(createGraphObject(createTreeOfLife()));
    controller.start();
    onCleanup(() => controller.dispose());
  });

  return <div class="scene" ref={host} />;
}
