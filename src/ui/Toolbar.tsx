import { type Accessor, For } from "solid-js";

import { COLOUR_SCHEMES } from "~/graph/colourSchemes";
import {
  type ColourScheme,
  EdgeAttributionKey,
  NodeAttributionKey,
} from "~/graph/types";
import "~/ui/Toolbar.scss";

interface ToolbarProps {
  nodeKeys: Accessor<Set<string>>;
  edgeKeys: Accessor<Set<string>>;
  onToggleNode: (key: string) => void;
  onToggleEdge: (key: string) => void;
  scheme: Accessor<ColourScheme>;
  onSelectScheme: (scheme: ColourScheme) => void;
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

/** Top-bar controls: label attribution toggles and colour-scheme selection. */
export function Toolbar(props: ToolbarProps) {
  return (
    <div class="toolbar">
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

      <div class="group">
        <span class="group-title">Colours</span>
        <For each={COLOUR_SCHEMES}>
          {(scheme) => (
            <label class="toggle">
              <input
                type="radio"
                name="colour-scheme"
                checked={props.scheme().id === scheme.id}
                onChange={() => props.onSelectScheme(scheme)}
              />
              <span>{scheme.name}</span>
            </label>
          )}
        </For>
      </div>
    </div>
  );
}
