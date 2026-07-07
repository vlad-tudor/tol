import { onCleanup, onMount } from "solid-js";

import { SceneController } from "~/three/SceneController";

/**
 * Solid host for the three.js scene. Owns the mount element's lifecycle and
 * nothing else — all rendering logic lives in {@link SceneController}, which is
 * created on mount and disposed on cleanup so hot-reload never leaks a canvas.
 */
export function Scene() {
  let host!: HTMLDivElement;

  onMount(() => {
    const controller = new SceneController(host);
    controller.start();
    onCleanup(() => controller.dispose());
  });

  return <div class="scene" ref={host} />;
}
