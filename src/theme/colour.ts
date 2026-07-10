// Colour maths shared across the renderer. Colours are `0xRRGGBB` integers —
// three.js's native form.

/** The red, green, and blue channels (0–255) of a `0xRRGGBB` colour. */
export function rgbChannels(colour: number): {
  r: number;
  g: number;
  b: number;
} {
  return {
    r: (colour >> 16) & 0xff,
    g: (colour >> 8) & 0xff,
    b: colour & 0xff,
  };
}

/** Format a `0xRRGGBB` colour as a CSS hex string, e.g. `#05050a`. */
export function toCssHex(colour: number): string {
  return `#${colour.toString(16).padStart(6, "0")}`;
}

// Rec. 601 luma coefficients — the perceptual weight of each channel (they sum
// to 1): the eye is most sensitive to green, least to blue.
const LUMA_RED = 0.299;
const LUMA_GREEN = 0.587;
const LUMA_BLUE = 0.114;

/**
 * Perceptual lightness of a `0xRRGGBB` colour, on a 0–255 scale.
 *
 * @param colour - the colour to weigh
 * @returns its Rec. 601 luma — used to decide whether a sphere is dark enough
 *   to need light-ink labels
 */
export function luminance(colour: number): number {
  const { r, g, b } = rgbChannels(colour);
  return LUMA_RED * r + LUMA_GREEN * g + LUMA_BLUE * b;
}
