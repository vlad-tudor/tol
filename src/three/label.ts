import {
  CanvasTexture,
  LinearFilter,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
} from "three";

import { toCssHex } from "~/theme/colour";

const FONT_SIZE = 64; // canvas px — high enough to stay crisp when scaled down
const FONT_FAMILY = "system-ui, sans-serif";
const FONT_WEIGHT = 600;
const PADDING = 12; // canvas px of breathing room around the text
const LINE_HEIGHT_FACTOR = 1.25; // canvas line spacing as a multiple of font size
const RENDER_ORDER = 10; // draw after the geometry so labels sit on top

/** An outline drawn behind a label's glyphs so it reads over any colour. */
export interface LabelOutline {
  /** Contour colour, in `0xRRGGBB` form. */
  color: number;
  /** Stroke width as a fraction of the font size. */
  width: number;
}

/** How a label is drawn — colour, size, and an optional legibility outline. */
export interface LabelStyle {
  color: number;
  lineWorldHeight: number;
  outline?: LabelOutline;
}

/**
 * Build a billboarded, multi-line text label: the lines are drawn stacked onto
 * a canvas (with an optional contour stroke behind the fill), turned into a
 * texture, and wrapped in a Sprite that always faces the camera, renders on top
 * of the geometry, and is exempt from tone mapping so its colour stays exact.
 *
 * @param lines - the text lines to stack, top to bottom
 * @param style - the label's colour, per-line world height, and optional outline
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
  const strokeWidth = style.outline ? FONT_SIZE * style.outline.width : 0;
  const padding = PADDING + Math.ceil(strokeWidth);

  context.font = font;
  const widest = Math.max(...lines.map((line) => context.measureText(line).width), 0);

  canvas.width = Math.ceil(widest + padding * 2);
  canvas.height = Math.ceil(lineHeight * lines.length + padding * 2);

  // Resizing the canvas resets its context, so re-apply the drawing state.
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const centreX = canvas.width / 2;
  const lineY = (index: number): number => padding + lineHeight * (index + 0.5);

  if (style.outline) {
    context.lineJoin = "round";
    context.miterLimit = 2;
    context.lineWidth = strokeWidth;
    context.strokeStyle = toCssHex(style.outline.color);
    lines.forEach((line, index) => context.strokeText(line, centreX, lineY(index)));
  }
  context.fillStyle = toCssHex(style.color);
  lines.forEach((line, index) => context.fillText(line, centreX, lineY(index)));

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter; // a flat 2D label needs no mipmaps

  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  material.toneMapped = false; // UI text — keep its colour exact under tone mapping

  const sprite = new Sprite(material);
  const worldHeight = style.lineWorldHeight * lines.length;
  sprite.scale.set(worldHeight * (canvas.width / canvas.height), worldHeight, 1);
  sprite.renderOrder = RENDER_ORDER;
  return sprite;
}
