import { type Component, createSignal, type Setter } from "solid-js";

import { INITIAL_COLOUR_SCHEME } from "~/graph/colourSchemes";
import {
  type ColourScheme,
  EdgeAttributionKey,
  NodeAttributionKey,
} from "~/graph/types";
import { DEFAULT_STYLE, type SceneStyle } from "~/three/styles";
import { Scene } from "~/ui/Scene";
import { Toolbar } from "~/ui/Toolbar";

/** Toggle a key in a Set-valued signal, replacing the Set so Solid reacts. */
function makeToggle(setter: Setter<Set<string>>): (key: string) => void {
  return (key) =>
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
}

export const App: Component = () => {
  const [nodeKeys, setNodeKeys] = createSignal<Set<string>>(
    new Set([NodeAttributionKey.Name]),
  );
  const [edgeKeys, setEdgeKeys] = createSignal<Set<string>>(
    new Set([EdgeAttributionKey.LetterName]),
  );
  const [scheme, setScheme] = createSignal<ColourScheme>(INITIAL_COLOUR_SCHEME);
  const [style, setStyle] = createSignal<SceneStyle>(DEFAULT_STYLE);
  const [nodeOutline, setNodeOutline] = createSignal(false);

  return (
    <>
      <Toolbar
        nodeKeys={nodeKeys}
        edgeKeys={edgeKeys}
        onToggleNode={makeToggle(setNodeKeys)}
        onToggleEdge={makeToggle(setEdgeKeys)}
        scheme={scheme}
        onSelectScheme={setScheme}
        style={style}
        onSelectStyle={setStyle}
        nodeOutline={nodeOutline}
        onToggleNodeOutline={() => setNodeOutline((on) => !on)}
      />
      <Scene
        nodeKeys={nodeKeys}
        edgeKeys={edgeKeys}
        scheme={scheme}
        style={style}
        nodeOutline={nodeOutline}
      />
    </>
  );
};
