import {
  CanvasTexture,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";

import { palette, toCssHex } from "~/theme/palette";

const FONT_SIZE = 64; // canvas px — high enough to stay crisp when scaled down
const FONT_FAMILY = "system-ui, sans-serif";
const FONT_WEIGHT = 600;
const PADDING = 12; // canvas px of breathing room around the text
const WORLD_HEIGHT = 0.55; // on-screen height of the label, in world units
const RENDER_ORDER = 10; // draw after the geometry so labels sit on top

/**
 * Build a billboarded text label: the text is drawn to a canvas, turned into a
 * texture, and wrapped in a Sprite so it always faces the camera — legible from
 * any orbit angle.
 *
 * @param text - the text to render
 * @returns a Sprite showing `text`, scaled to world units and preserving the
 *   text's aspect ratio; the caller positions it. It owns its texture and
 *   material.
 */
export function createLabel(text: string): Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("2D canvas context unavailable — cannot render a label");
  }

  const font = `${FONT_WEIGHT} ${FONT_SIZE}px ${FONT_FAMILY}`;
  context.font = font;
  const textWidth = context.measureText(text).width;

  canvas.width = Math.ceil(textWidth + PADDING * 2);
  canvas.height = Math.ceil(FONT_SIZE + PADDING * 2);

  // Resizing the canvas resets its context, so re-apply the drawing state.
  context.font = font;
  context.fillStyle = toCssHex(palette.node);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter; // a flat 2D label needs no mipmaps

  // depthTest off + a high renderOrder keeps the label on top of all geometry,
  // so it's never occluded by or clipped into a sphere or tube.
  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new Sprite(material);
  sprite.scale.set(WORLD_HEIGHT * (canvas.width / canvas.height), WORLD_HEIGHT, 1);
  sprite.renderOrder = RENDER_ORDER;
  return sprite;
}
