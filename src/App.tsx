import { type Component, createSignal, type Setter } from "solid-js";

import { EdgeAttributionKey, NodeAttributionKey } from "~/graph/types";
import { LabelMenu } from "~/ui/LabelMenu";
import { Scene } from "~/ui/Scene";

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

  return (
    <>
      <LabelMenu
        nodeKeys={nodeKeys}
        edgeKeys={edgeKeys}
        onToggleNode={makeToggle(setNodeKeys)}
        onToggleEdge={makeToggle(setEdgeKeys)}
      />
      <Scene nodeKeys={nodeKeys} edgeKeys={edgeKeys} />
    </>
  );
};
