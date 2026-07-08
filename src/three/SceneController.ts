import {
  AmbientLight,
  Color,
  DirectionalLight,
  type Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { palette } from "~/theme/palette";

const CAMERA_FOV = 50;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_DISTANCE = 14; // units back along +Z, framing the full tree

const AMBIENT_INTENSITY = 0.7;
const KEY_LIGHT_INTENSITY = 2.2;
const KEY_LIGHT_POSITION = { x: 5, y: 8, z: 10 };

/**
 * Owns the three.js render context and environment: renderer, camera, orbit
 * controls, lighting, and the animation loop. Content is *not* baked in — it
 * enters through {@link add}, keeping this a reusable stage that knows nothing
 * about the Tree of Life (or Solid, which merely mounts it).
 */
export class SceneController {
  private readonly host: HTMLElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly resizeObserver: ResizeObserver;
  private frameHandle = 0;

  constructor(host: HTMLElement) {
    this.host = host;

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    host.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color(palette.void);

    this.camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
    this.camera.position.set(0, 0, CAMERA_DISTANCE);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.scene.add(new AmbientLight(palette.light, AMBIENT_INTENSITY));
    const keyLight = new DirectionalLight(palette.light, KEY_LIGHT_INTENSITY);
    keyLight.position.set(
      KEY_LIGHT_POSITION.x,
      KEY_LIGHT_POSITION.y,
      KEY_LIGHT_POSITION.z,
    );
    this.scene.add(keyLight);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
  }

  /**
   * Add content to the scene — the minimal seam between the stage and whatever
   * it renders. Grown on demand, not a speculative scene-graph API.
   *
   * @param objects - three.js objects to add to the scene root
   */
  public add(...objects: Object3D[]): void {
    this.scene.add(...objects);
  }

  /** Start the render loop. Pair with {@link dispose}. */
  public start(): void {
    const tick = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.frameHandle = requestAnimationFrame(tick);
    };
    tick();
  }

  /** Tear down the render loop, observers, and the renderer's GPU resources. */
  public dispose(): void {
    cancelAnimationFrame(this.frameHandle);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resize(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height || 1;
    this.camera.updateProjectionMatrix();
  }
}
