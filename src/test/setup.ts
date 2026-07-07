import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Registers a DOM into the global scope so Solid's reactive primitives resolve
// their browser build under `bun test`. Pure `graph/` tests don't need it, but
// component and store tests do — keeping it here means test files stay clean.
GlobalRegistrator.register();
