import type { ColourScheme } from "~/graph/types";

// The hex values below are interpretations of the traditional Golden Dawn
// colour scales (Book 777). This file is the single place to refine them —
// sephira colours key by sephira id, path colours by letter name. Anything
// omitted falls back to the render palette default.

/** The "ink" scheme — spheres and paths render white with a dark border. */
export const DEFAULT_SCHEME: ColourScheme = {
  id: "default",
  name: "Default",
  sephira: {},
  path: {},
  neutral: true,
};

/** King scale (Atziluth) — the pure, primary world. The default on load. */
export const KING_SCALE: ColourScheme = {
  id: "king",
  name: "King (Atziluth)",
  sephira: {
    keter: 0xfbfbf7,
    chokmah: 0x9fc4e8,
    binah: 0x8c1d33,
    chesed: 0x4b2a8a,
    gevurah: 0xe5751f,
    tiferet: 0xf0a9b4,
    netzach: 0xe0a421,
    hod: 0x6e3b99,
    yesod: 0x2e3c86,
    malkuth: 0xe6c63c,
  },
  path: {
    Aleph: 0xf5ee9e,
    Beth: 0xf2de3a,
    Gimel: 0x4a7cc0,
    Daleth: 0x37a05b,
    Heh: 0xe23b24,
    Vav: 0xe85e27,
    Zayin: 0xef8b22,
    Cheth: 0xe9a81e,
    Teth: 0xe9da3e,
    Yod: 0xa9c63c,
    Kaph: 0x6e3b99,
    Lamed: 0x3fb878,
    Mem: 0x23409a,
    Nun: 0x1ea79c,
    Samekh: 0x4a7cc0,
    Ayin: 0x37307c,
    Peh: 0xd62828,
    Tzaddi: 0x6e3b99,
    Qoph: 0xa83b6e,
    Resh: 0xf0842b,
    Shin: 0xef5022,
    Tav: 0x2e3c86,
  },
};

/** Queen scale (Briah) — the reflected world; the tree's most-depicted colours. */
const QUEEN_SCALE: ColourScheme = {
  id: "queen",
  name: "Queen (Briah)",
  sephira: {
    keter: 0xffffff,
    chokmah: 0xb8b8b8,
    binah: 0x2b2b2b, // traditionally black; lifted so it reads on the dark void
    chesed: 0x2a57c4,
    gevurah: 0xc41e1e,
    tiferet: 0xf2c21e,
    netzach: 0x1fa85a,
    hod: 0xe8791e,
    yesod: 0x6b2fa0,
    malkuth: 0x7a5c2e, // the four colours (citrine/olive/russet/black), as one
  },
  path: {
    Aleph: 0xf2e97a,
    Beth: 0xe0c93a,
    Gimel: 0x5a86c8,
    Daleth: 0x53b06f,
    Heh: 0xd23a2a,
    Vav: 0xd85f34,
    Zayin: 0xe8912f,
    Cheth: 0xe0a83a,
    Teth: 0xdcc84a,
    Yod: 0x9fbf4a,
    Kaph: 0x7a4aa8,
    Lamed: 0x57bd84,
    Mem: 0x2f4fa8,
    Nun: 0x2fa89e,
    Samekh: 0x5a86c8,
    Ayin: 0x453d86,
    Peh: 0xcc3535,
    Tzaddi: 0x7a4aa8,
    Qoph: 0xa8507a,
    Resh: 0xe8923a,
    Shin: 0xe85f34,
    Tav: 0x3a4a86,
  },
};

/** Prince scale (Yetzirah) — the formative world; muted, blended tones. */
const PRINCE_SCALE: ColourScheme = {
  id: "prince",
  name: "Prince (Yetzirah)",
  sephira: {
    keter: 0xffffff,
    chokmah: 0xc7d8e8,
    binah: 0x4a3520,
    chesed: 0x5b2a86,
    gevurah: 0xe02222,
    tiferet: 0xf0917a,
    netzach: 0x7bc043,
    hod: 0x9b4a2a,
    yesod: 0x3a1f5c,
    malkuth: 0x6e5a2a,
  },
  path: {
    Aleph: 0x4ca890,
    Beth: 0x9e9e9e,
    Gimel: 0xa8c4d8,
    Daleth: 0x8fcb6e,
    Heh: 0xe8452a,
    Vav: 0x7a7a2a,
    Zayin: 0xc9a85a,
    Cheth: 0x7a2e3a,
    Teth: 0x4a2a6e,
    Yod: 0x8a9a78,
    Kaph: 0x3b6fb5,
    Lamed: 0x3fa890,
    Mem: 0x4a6a2a,
    Nun: 0x7a3a2a,
    Samekh: 0x4ca85a,
    Ayin: 0x2a2a3a,
    Peh: 0xb03a2a,
    Tzaddi: 0x7ab0d8,
    Qoph: 0xc89a8a,
    Resh: 0xe0a030,
    Shin: 0xe0401c,
    Tav: 0x2a2a3a,
  },
};

/** Princess scale (Assiah) — the material world; earthy, flecked colours. */
const PRINCESS_SCALE: ColourScheme = {
  id: "princess",
  name: "Princess (Assiah)",
  sephira: {
    keter: 0xfdfbe8,
    chokmah: 0xc8c0c0,
    binah: 0x8a7a80,
    chesed: 0x2e6aa8,
    gevurah: 0xa01818,
    tiferet: 0xe0a428,
    netzach: 0x6e6a2a,
    hod: 0x8a6a3a,
    yesod: 0x9a9a3a,
    malkuth: 0x33301a,
  },
  path: {
    Aleph: 0x2e9a6a,
    Beth: 0x3a3a6e,
    Gimel: 0xb8c8d8,
    Daleth: 0xd85a8a,
    Heh: 0xd62828,
    Vav: 0x6e4a2a,
    Zayin: 0xc9a85a,
    Cheth: 0x4a5a2a,
    Teth: 0xd07a2a,
    Yod: 0x6e3a5a,
    Kaph: 0x3a7ac0,
    Lamed: 0x9ac88a,
    Mem: 0xc8c0d8,
    Nun: 0x4a3a4a,
    Samekh: 0x2a4a9a,
    Ayin: 0x4a4a50,
    Peh: 0xd63a3a,
    Tzaddi: 0xc8c0d8,
    Qoph: 0xa89a8a,
    Resh: 0xe08030,
    Shin: 0xe0401c,
    Tav: 0x2a2a3a,
  },
};

/** All available colour schemes — the four Golden Dawn scales, plus Default. */
export const COLOUR_SCHEMES: ColourScheme[] = [
  DEFAULT_SCHEME,
  KING_SCALE,
  QUEEN_SCALE,
  PRINCE_SCALE,
  PRINCESS_SCALE,
];

/** The scheme active on load. */
export const INITIAL_COLOUR_SCHEME = KING_SCALE;
