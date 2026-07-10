import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  type Light,
  NeutralToneMapping,
  type Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  type Texture,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type { SceneStyle } from "~/three/styles";

const CAMERA_FOV = 50;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_DISTANCE = 20; // units back along +Z, framing the full tree
const MAX_PIXEL_RATIO = 2;
const TONE_MAPPING_EXPOSURE = 1;
const ENVIRONMENT_ROUGHNESS = 0.04;

// The canvas clears to fully transparent — the backdrop is the host's CSS
// gradient, not a WebGL clear colour.
const CLEAR_COLOR = 0x000000;
const CLEAR_ALPHA = 0;

/**
 * Owns the three.js render context: a tone-mapped renderer over a transparent
 * canvas, a prebaked room-environment map, orbit controls, and the animation
 * loop. The lighting and backdrop are set from a {@link SceneStyle} via
 * {@link setStyle}. Content enters through {@link add}; this class knows nothing
 * about the Tree of Life or Solid.
 */
export class SceneController {
  private readonly host: HTMLElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly environment: Texture;
  private readonly resizeObserver: ResizeObserver;
  private lights: Light[] = [];
  private frameHandle = 0;

  constructor(host: HTMLElement) {
    this.host = host;

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.setClearColor(CLEAR_COLOR, CLEAR_ALPHA);
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = TONE_MAPPING_EXPOSURE;
    host.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = null; // the backdrop is the host's CSS gradient

    const pmrem = new PMREMGenerator(this.renderer);
    this.environment = pmrem.fromScene(
      new RoomEnvironment(),
      ENVIRONMENT_ROUGHNESS,
    ).texture;
    pmrem.dispose();
    this.scene.environment = this.environment;

    this.camera = new PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR);
    this.camera.position.set(0, 0, CAMERA_DISTANCE);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
  }

  /**
   * Apply a scene style: swap the backdrop gradient and rebuild the lighting.
   * Tone mapping and the environment map are shared across styles.
   *
   * @param style - the look to apply
   */
  public setStyle(style: SceneStyle): void {
    this.host.style.background = style.background;

    for (const light of this.lights) this.scene.remove(light);
    const hemisphere = new HemisphereLight(
      style.light.sky,
      style.light.ground,
      style.light.hemiIntensity,
    );
    const keyLight = new DirectionalLight(
      style.light.keyColour,
      style.light.keyIntensity,
    );
    keyLight.position.set(
      style.light.keyPosition.x,
      style.light.keyPosition.y,
      style.light.keyPosition.z,
    );
    const fillLight = new AmbientLight(
      style.light.fillColour,
      style.light.fillIntensity,
    );
    this.lights = [hemisphere, keyLight, fillLight];
    for (const light of this.lights) this.scene.add(light);
  }

  /**
   * Add content to the scene — the minimal seam between the stage and whatever
   * it renders.
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

  /** Tear down the render loop, observers, and GPU resources. */
  public dispose(): void {
    cancelAnimationFrame(this.frameHandle);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.environment.dispose();
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
