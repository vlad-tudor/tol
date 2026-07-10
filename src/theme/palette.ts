import { toCssHex } from "~/theme/colour";

/**
 * The single source of truth for colour across the app. Colours are authored as
 * `0xRRGGBB` numbers — three.js's native form, consumed directly by materials
 * and lights. The DOM receives the ones it needs as CSS custom properties via
 * {@link applyThemeVariables}, so SCSS never re-declares a colour value.
 */
export const palette = {
  /** Scene background — the near-black "void". */
  void: 0x05050a,
  /** Sephira spheres (default, uncoloured). */
  node: 0xf4e8c1,
  /** Path tubes (default, uncoloured). */
  edge: 0x8a7fbf,
  /** Neutral white. */
  light: 0xffffff,
  // Adaptive label inks + contours — legible on any sphere/tube colour. The
  // node ink flips by sphere lightness; the contour is the opposite tone.
  labelInkLight: 0xf6eed6,
  labelInkDark: 0x241f0e,
  labelContourDark: 0x0c0a14,
  edgeLabelInk: 0xe6ddff,
  edgeLabelContour: 0x0c0a16,
  // Path label ink + contour for light backgrounds (dark ink on a pale halo).
  edgeLabelInkLight: 0x2a2417,
  edgeLabelContourLight: 0xf3ecda,
} as const;

/** The palette colours the DOM also needs, keyed by CSS custom property name. */
const CSS_COLOR_VARIABLES: Record<string, number> = {
  "--color-void": palette.void,
  "--color-node": palette.node,
  "--color-edge": palette.edge,
};

/**
 * Publish the shared palette colours to the DOM as CSS custom properties on the
 * document root, so stylesheets reference `var(--color-void)` without ever
 * re-declaring a colour.
 *
 * @param root - element to set the properties on; defaults to `<html>`
 */
export function applyThemeVariables(
  root: HTMLElement = document.documentElement,
): void {
  for (const [name, color] of Object.entries(CSS_COLOR_VARIABLES)) {
    root.style.setProperty(name, toCssHex(color));
  }
}
