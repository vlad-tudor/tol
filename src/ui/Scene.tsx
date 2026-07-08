import { onCleanup, onMount } from "solid-js";

import { createSphere, createTube } from "~/three/meshes";
import { SceneController } from "~/three/SceneController";

/**
 * Solid host for the three.js scene. Owns the mount element's lifecycle, builds
 * the scene content, and hands it to the {@link SceneController} stage through
 * its public seam rather than baking content into the controller.
 */
export function Scene() {
  let host!: HTMLDivElement;

  onMount(() => {
    const controller = new SceneController(host);

    // Two spheres joined by a tube — the current content.
    const left = { x: -2, y: 0, z: 0 };
    const right = { x: 2, y: 0, z: 0 };
    controller.add(
      createSphere(left),
      createSphere(right),
      createTube(left, right),
    );

    controller.start();
    onCleanup(() => controller.dispose());
  });

  return <div class="scene" ref={host} />;
}
