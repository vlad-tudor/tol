import type { ColourScheme } from "~/graph/types";

/**
 * The default scheme: no overrides, so every element falls back to its palette
 * colour (ivory spheres, violet paths). The Golden Dawn scales — King (Atziluth),
 * Queen (Briah), Prince (Yetzirah), Princess (Assiah) — and other schemes are
 * added here as full colour maps: `sephira` keyed by sephira id, `path` keyed by
 * letter name.
 */
export const DEFAULT_SCHEME: ColourScheme = {
  id: "default",
  name: "Default",
  sephira: {},
  path: {},
};

/** All available colour schemes. */
export const COLOUR_SCHEMES: ColourScheme[] = [DEFAULT_SCHEME];

/** The scheme shown by default. */
export const DEFAULT_COLOUR_SCHEME = DEFAULT_SCHEME;
