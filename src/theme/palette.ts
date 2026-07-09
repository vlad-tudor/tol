/**
 * The single source of truth for colour across the app. Colours are authored as
 * `0xRRGGBB` numbers — three.js's native form, consumed directly by materials
 * and lights. The DOM receives the ones it needs as CSS custom properties via
 * {@link applyThemeVariables}, so SCSS never re-declares a colour value.
 */
export const palette = {
  /** Scene background — the near-black "void". */
  void: 0x05050a,
  /** Sephira spheres. */
  node: 0xf4e8c1,
  nodeEmissive: 0x2a2410,
  /** Sephira labels — dark, to read against the ivory spheres they sit on. */
  nodeLabel: 0x2a2410,
  /** Path tubes. */
  edge: 0x8a7fbf,
  edgeEmissive: 0x141024,
  /** Path labels — a lighter lavender so they read clearly over the tubes. */
  edgeLabel: 0xc9bff5,
  /** Neutral white, for lighting. */
  light: 0xffffff,
} as const;

/**
 * Format a `0xRRGGBB` colour number as a CSS hex string.
 *
 * @param color - a colour in `0xRRGGBB` form
 * @returns the equivalent CSS hex string, e.g. `#05050a`
 */
export function toCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

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
