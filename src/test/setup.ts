import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Registers a DOM into the global scope so Solid's reactive primitives resolve
// their browser build under `bun test`. Pure `graph/` tests don't need it, but
// component, store, and three.js tests do — keeping it here means test files
// stay clean.
GlobalRegistrator.register();

// happy-dom has no canvas 2D context, so stub the calls that label rendering
// makes. This lets headless tests build label sprites without a real canvas;
// nothing here is drawn or asserted, it just has to not be null.
const stubContext = {
  font: "",
  fillStyle: "",
  textAlign: "",
  textBaseline: "",
  measureText: (text: string) => ({ width: text.length * 10 }),
  fillText: () => {},
};
HTMLCanvasElement.prototype.getContext = (() =>
  stubContext) as unknown as HTMLCanvasElement["getContext"];
