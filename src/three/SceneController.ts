import {
  AmbientLight,
  Color,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Owns the three.js rendering context for the Tree of Life: renderer, camera,
 * lighting, orbit controls, and the animation loop. Deliberately
 * framework-agnostic — {@link Scene} (Solid) mounts it, but this class knows
 * nothing about Solid and can be driven from a plain DOM element in a test.
 *
 * At this stage the scene is empty; nodes and edges are added in a later phase.
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
    this.#camera.position.set(0, 4, 14);

    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;

    this.#scene.add(new AmbientLight(0xffffff, 0.4));
    const keyLight = new PointLight(0xffffff, 120);
    keyLight.position.set(6, 10, 8);
    this.#scene.add(keyLight);

    this.#resizeObserver = new ResizeObserver(() => this.#resize());
    this.#resizeObserver.observe(host);
    this.#resize();
  }

  /** The three.js scene graph, so later phases can add node and edge meshes. */
  get scene(): Scene {
    return this.#scene;
  }

  /** Start the render loop. Idempotent callers should pair this with {@link dispose}. */
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
