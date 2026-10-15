import { describe, expect, it } from "vitest";
import {
  applyHomography,
  isConvexQuad,
  quadSize,
  rectQuad,
  solveHomography,
  toCssMatrix3d,
  triangleAffine,
  type Point,
  type Quad,
} from "../geometry";

const expectPoint = (p: Point, q: Point, digits = 6) => {
  expect(p[0]).toBeCloseTo(q[0], digits);
  expect(p[1]).toBeCloseTo(q[1], digits);
};

const angled: Quad = [[100, 80], [900, 20], [920, 700], [90, 600]];

describe("homography", () => {
  it("maps every source corner onto the destination quad", () => {
    const H = solveHomography(rectQuad(400, 300), angled)!;
    rectQuad(400, 300).forEach((p, i) => expectPoint(applyHomography(H, p), angled[i]));
  });

  it("round-trips through the inverse", () => {
    const src = rectQuad(12, 9);
    const H = solveHomography(src, angled)!;
    const Hinv = solveHomography(angled, src)!;
    expectPoint(applyHomography(Hinv, applyHomography(H, [3.3, 7.1])), [3.3, 7.1]);
  });

  it("rejects degenerate quads", () => {
    expect(solveHomography(rectQuad(10, 10), [[0, 0], [5, 0], [10, 0], [0, 10]])).toBeNull();
  });

  it("writes CSS matrix3d in column-major order", () => {
    expect(toCssMatrix3d([1, 2, 3, 4, 5, 6, 7, 8, 1])).toBe("matrix3d(1,4,0,7,2,5,0,8,0,0,1,0,3,6,0,1)");
  });

  it("measures a rectangle on a perspective wall in feet", () => {
    const toPhoto = solveHomography(rectQuad(12, 9), angled)!;
    const art = ([[3, 2], [9, 2], [9, 6], [3, 6]] as Point[]).map((p) => applyHomography(toPhoto, p)) as Quad;
    const { width, height } = quadSize(solveHomography(angled, rectQuad(12, 9))!, art);
    expect(width).toBeCloseTo(6, 6);
    expect(height).toBeCloseTo(4, 6);
  });
});

describe("isConvexQuad", () => {
  it("accepts convex and rejects bow-tie or dented quads", () => {
    expect(isConvexQuad(angled)).toBe(true);
    expect(isConvexQuad([[0, 0], [10, 10], [10, 0], [0, 10]])).toBe(false);
    expect(isConvexQuad([[0, 0], [10, 0], [4, 4], [0, 10]])).toBe(false);
  });
});

describe("triangleAffine", () => {
  it("maps the source triangle onto the destination", () => {
    const s: Point[] = [[0, 0], [10, 0], [0, 10]];
    const d: Point[] = [[5, 5], [25, 8], [3, 30]];
    const [a, b, c, dd, e, f] = triangleAffine(s[0], s[1], s[2], d[0], d[1], d[2])!;
    s.forEach(([x, y], i) => expectPoint([a * x + c * y + e, b * x + dd * y + f], d[i]));
  });
});
