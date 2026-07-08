import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { createSphere, createTube } from "~/three/meshes";

/**
 * Owns the three.js rendering context: renderer, camera, lighting, orbit
 * controls, and the animation loop. Deliberately framework-agnostic —
 * {@link Scene} (Solid) mounts it, but this class knows nothing about Solid.
 *
 * For now the scene is just two spheres joined by a tube — the smallest thing
 * worth seeing on screen. It grows from here.
 */
export class SceneController {
  readonly #host: HTMLElement;
  readonly #renderer: WebGLRenderer;
  readonly #scene: Scene;
  readonly #camera: PerspectiveCamera;
  readonly #controls: OrbitControls;
  readonly #resizeObserver: ResizeObserver;
  #frameHandle = 0;

  constructor(host: HTMLElement) {
    this.#host = host;

    this.#renderer = new WebGLRenderer({ antialias: true });
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    host.appendChild(this.#renderer.domElement);

    this.#scene = new Scene();
    this.#scene.background = new Color(0x05050a);

    this.#camera = new PerspectiveCamera(50, 1, 0.1, 100);
    this.#camera.position.set(0, 0, 8);

    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;

    this.#scene.add(new AmbientLight(0xffffff, 0.7));
    const keyLight = new DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 10);
    this.#scene.add(keyLight);

    const left = { x: -2, y: 0, z: 0 };
    const right = { x: 2, y: 0, z: 0 };
    this.#scene.add(createSphere(left));
    this.#scene.add(createSphere(right));
    this.#scene.add(createTube(left, right));

    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(host);
    this.#resize();
  }

  /** Start the render loop. Pair with {@link dispose}. */
  start(): void {
    const tick = () => {
      this.#controls.update();
      this.#renderer.render(this.#scene, this.#camera);
      this.#frameHandle = requestAnimationFrame(tick);
    };
    tick();
  }

  /** Tear down the render loop, observers, and GPU resources. */
  dispose(): void {
    cancelAnimationFrame(this.#frameHandle);
    this.#resizeObserver.disconnect();
    this.#controls.dispose();
    this.#renderer.dispose();
    this.#renderer.domElement.remove();
  }

  #resize(): void {
    const width = this.#host.clientWidth;
    const height = this.#host.clientHeight;
    this.#renderer.setSize(width, height, false);
    this.#camera.aspect = width / height || 1;
    this.#camera.updateProjectionMatrix();
  }
}
