import type { TreeVariant } from "~/graph/types";

/**
 * The classical (Kircher) tree: the twenty-two paths in the standard Golden
 * Dawn letter mapping. Other structural variants (Gra, Ari, …) differ mainly in
 * the diagonal and bottom paths, and would each be another entry here over the
 * same shared sephirot.
 */
export const KIRCHER_VARIANT: TreeVariant = {
  id: "kircher",
  name: "Kircher",
  paths: [
    { endpoints: ["keter", "chokmah"], letter: { name: "Aleph", hebrew: "א", number: 11 } },
    { endpoints: ["keter", "binah"], letter: { name: "Beth", hebrew: "ב", number: 12 } },
    { endpoints: ["keter", "tiferet"], letter: { name: "Gimel", hebrew: "ג", number: 13 } },
    { endpoints: ["chokmah", "binah"], letter: { name: "Daleth", hebrew: "ד", number: 14 } },
    { endpoints: ["chokmah", "chesed"], letter: { name: "Vav", hebrew: "ו", number: 16 } },
    { endpoints: ["chokmah", "tiferet"], letter: { name: "Heh", hebrew: "ה", number: 15 } },
    { endpoints: ["binah", "gevurah"], letter: { name: "Cheth", hebrew: "ח", number: 18 } },
    { endpoints: ["binah", "tiferet"], letter: { name: "Zayin", hebrew: "ז", number: 17 } },
    { endpoints: ["chesed", "gevurah"], letter: { name: "Teth", hebrew: "ט", number: 19 } },
    { endpoints: ["chesed", "tiferet"], letter: { name: "Yod", hebrew: "י", number: 20 } },
    { endpoints: ["chesed", "netzach"], letter: { name: "Kaph", hebrew: "כ", number: 21 } },
    { endpoints: ["gevurah", "tiferet"], letter: { name: "Lamed", hebrew: "ל", number: 22 } },
    { endpoints: ["gevurah", "hod"], letter: { name: "Mem", hebrew: "מ", number: 23 } },
    { endpoints: ["tiferet", "netzach"], letter: { name: "Nun", hebrew: "נ", number: 24 } },
    { endpoints: ["tiferet", "hod"], letter: { name: "Ayin", hebrew: "ע", number: 26 } },
    { endpoints: ["tiferet", "yesod"], letter: { name: "Samekh", hebrew: "ס", number: 25 } },
    { endpoints: ["netzach", "hod"], letter: { name: "Peh", hebrew: "פ", number: 27 } },
    { endpoints: ["netzach", "yesod"], letter: { name: "Tzaddi", hebrew: "צ", number: 28 } },
    { endpoints: ["netzach", "malkuth"], letter: { name: "Qoph", hebrew: "ק", number: 29 } },
    { endpoints: ["hod", "yesod"], letter: { name: "Resh", hebrew: "ר", number: 30 } },
    { endpoints: ["hod", "malkuth"], letter: { name: "Shin", hebrew: "ש", number: 31 } },
    { endpoints: ["yesod", "malkuth"], letter: { name: "Tav", hebrew: "ת", number: 32 } },
  ],
};

/** All available structural variants. */
export const TREE_VARIANTS: TreeVariant[] = [KIRCHER_VARIANT];

/** The variant shown by default. */
export const DEFAULT_VARIANT = KIRCHER_VARIANT;
