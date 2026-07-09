import {
  CanvasTexture,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";

import { toCssHex } from "~/theme/palette";

const FONT_SIZE = 64; // canvas px — high enough to stay crisp when scaled down
const FONT_FAMILY = "system-ui, sans-serif";
const FONT_WEIGHT = 600;
const PADDING = 12; // canvas px of breathing room around the text
const LINE_HEIGHT_FACTOR = 1.25; // canvas line spacing as a multiple of font size
const RENDER_ORDER = 10; // draw after the geometry so labels sit on top

/** How a label is drawn — its colour and on-screen size. */
export interface LabelStyle {
  /** Text colour, in `0xRRGGBB` form. */
  color: number;
  /** On-screen height per line, in world units. */
  lineWorldHeight: number;
}

/**
 * Build a billboarded, multi-line text label: the lines are drawn stacked onto
 * a canvas, turned into a texture, and wrapped in a Sprite so the label always
 * faces the camera (legible from any orbit angle) and renders on top of the
 * geometry (never occluded or clipped).
 *
 * @param lines - the text lines to stack, top to bottom
 * @param style - the label's colour and per-line world height
 * @returns a Sprite showing the lines, scaled to world units and preserving the
 *   text's aspect ratio; the caller positions it. It owns its texture and
 *   material.
 */
export function createLabel(lines: string[], style: LabelStyle): Sprite {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("2D canvas context unavailable — cannot render a label");
  }

  const font = `${FONT_WEIGHT} ${FONT_SIZE}px ${FONT_FAMILY}`;
  const lineHeight = FONT_SIZE * LINE_HEIGHT_FACTOR;
  context.font = font;
  const widest = Math.max(...lines.map((line) => context.measureText(line).width), 0);

  canvas.width = Math.ceil(widest + PADDING * 2);
  canvas.height = Math.ceil(lineHeight * lines.length + PADDING * 2);

  // Resizing the canvas resets its context, so re-apply the drawing state.
  context.font = font;
  context.fillStyle = toCssHex(style.color);
  context.textAlign = "center";
  context.textBaseline = "middle";
  lines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, PADDING + lineHeight * (index + 0.5));
  });

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
  const worldHeight = style.lineWorldHeight * lines.length;
  sprite.scale.set(worldHeight * (canvas.width / canvas.height), worldHeight, 1);
  sprite.renderOrder = RENDER_ORDER;
  return sprite;
}
