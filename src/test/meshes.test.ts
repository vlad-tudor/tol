import { describe, expect, test } from "bun:test";

import { createTubeGeometry } from "~/three/meshes";

describe("createTubeGeometry", () => {
  test("spans exactly the distance between its endpoints", () => {
    const geometry = createTubeGeometry(
      { x: 0, y: 0, z: 0 },
      { x: 3, y: 4, z: 0 },
    );
    expect(geometry.parameters.path.getLength()).toBeCloseTo(5);
  });
});
