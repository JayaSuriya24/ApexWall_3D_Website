import { describe, expect, it } from "vitest";
import { getShape, SHAPES, shapeFillRatio, shapePoints, toPathD } from "../shapes";

describe("shapes", () => {
  it("fill ratios match the geometry", () => {
    expect(shapeFillRatio(getShape("rect"))).toBe(1);
    expect(shapeFillRatio(getShape("circle"))).toBeCloseTo(Math.PI / 4, 2);
    expect(shapeFillRatio(getShape("oval"), 10, 4)).toBeCloseTo(Math.PI / 4, 2);
    expect(shapeFillRatio(getShape("diamond"))).toBeCloseTo(0.5, 9);
    expect(shapeFillRatio(getShape("hexagon"))).toBeCloseTo(0.75, 9);
    expect(shapeFillRatio(getShape("arch"), 10, 10)).toBeCloseTo((50 + (Math.PI * 25) / 2) / 100, 2);
  });

  it("stay inside their box, offset by the source rect", () => {
    for (const s of SHAPES.filter((s) => s.points)) {
      for (const [x, y] of shapePoints(s, { x: 100, y: 50, w: 40, h: 30 })!) {
        expect(x).toBeGreaterThanOrEqual(100 - 1e-9);
        expect(x).toBeLessThanOrEqual(140 + 1e-9);
        expect(y).toBeGreaterThanOrEqual(50 - 1e-9);
        expect(y).toBeLessThanOrEqual(80 + 1e-9);
      }
    }
    expect(shapePoints(getShape("rect"), { x: 0, y: 0, w: 1, h: 1 })).toBeNull();
  });

  it("falls back to rectangle and writes closed paths", () => {
    expect(getShape("nope").id).toBe("rect");
    expect(toPathD([[0, 0], [1, 0], [0, 1]])).toBe("M0.0 0.0L1.0 0.0L0.0 1.0Z");
  });
});
