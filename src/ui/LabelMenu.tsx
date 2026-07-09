import { type Accessor, For } from "solid-js";

import { EdgeAttributionKey, NodeAttributionKey } from "~/graph/types";
import "~/ui/LabelMenu.scss";

interface LabelMenuProps {
  nodeKeys: Accessor<Set<string>>;
  edgeKeys: Accessor<Set<string>>;
  onToggleNode: (key: string) => void;
  onToggleEdge: (key: string) => void;
}

interface Category {
  key: string;
  label: string;
}

const NODE_CATEGORIES: Category[] = [
  { key: NodeAttributionKey.Name, label: "Name" },
  { key: NodeAttributionKey.Number, label: "Number" },
  { key: NodeAttributionKey.Hebrew, label: "Hebrew" },
];

const EDGE_CATEGORIES: Category[] = [
  { key: EdgeAttributionKey.LetterName, label: "Letter" },
  { key: EdgeAttributionKey.PathNumber, label: "Number" },
  { key: EdgeAttributionKey.HebrewLetter, label: "Hebrew" },
];

/** Top-bar menu toggling which label attributions show on sephirot and paths. */
export function LabelMenu(props: LabelMenuProps) {
  return (
    <div class="label-menu">
      <div class="group">
        <span class="group-title">Sefirot</span>
        <For each={NODE_CATEGORIES}>
          {(category) => (
            <label class="toggle">
              <input
                type="checkbox"
                checked={props.nodeKeys().has(category.key)}
                onChange={() => props.onToggleNode(category.key)}
              />
              <span>{category.label}</span>
            </label>
          )}
        </For>
      </div>

      <div class="group">
        <span class="group-title">Paths</span>
        <For each={EDGE_CATEGORIES}>
          {(category) => (
            <label class="toggle">
              <input
                type="checkbox"
                checked={props.edgeKeys().has(category.key)}
                onChange={() => props.onToggleEdge(category.key)}
              />
              <span>{category.label}</span>
            </label>
          )}
        </For>
      </div>
    </div>
  );
}
