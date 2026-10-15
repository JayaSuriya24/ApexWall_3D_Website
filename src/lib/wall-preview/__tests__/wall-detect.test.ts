import { describe, expect, it } from "vitest";
import type { Point, Quad } from "../geometry";
import { findWallInImage } from "../wall-detect";

// Paints a synthetic room: ceiling, side walls, a plank floor and the main wall.
function room(W: number, H: number, wall: Quad, seed = 1) {
  const data = new Uint8ClampedArray(W * H * 4);
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const inPoly = (x: number, y: number, poly: Point[]) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const [tl, tr] = wall;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v: number;
      if (inPoly(x, y, wall)) v = 205 - (x / W) * 15;
      else if (y < tl[1] + ((tr[1] - tl[1]) * (x - tl[0])) / (tr[0] - tl[0]) && x > tl[0] && x < tr[0]) v = 238; // ceiling
      else if (x <= tl[0] || x >= tr[0]) v = 172; // side walls
      else v = 120 + ((Math.floor(x / 14) + Math.floor(y / 9)) % 2) * 22; // plank floor
      v += (rand() - 0.5) * 6;
      const i = (y * W + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  return { data, width: W, height: H };
}

const worstError = (a: Quad, b: Quad) => Math.max(...a.map((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1])));

describe("findWallInImage", () => {
  it("finds a straight-on wall between side walls, ceiling and plank floor", () => {
    const wall: Quad = [[60, 40], [420, 40], [420, 250], [60, 250]];
    const r = findWallInImage(room(480, 320, wall));
    expect(r.confident).toBe(true);
    expect(worstError(r.quad!, wall)).toBeLessThan(4);
  });

  it("finds an angled wall", () => {
    const wall: Quad = [[50, 45], [460, 12], [460, 300], [50, 250]];
    const r = findWallInImage(room(480, 320, wall, 7));
    expect(r.confident).toBe(true);
    expect(worstError(r.quad!, wall)).toBeLessThan(5);
  });

  it("offers the true corners for snapping", () => {
    const wall: Quad = [[60, 40], [420, 40], [420, 250], [60, 250]];
    const r = findWallInImage(room(480, 320, wall, 3));
    for (const c of wall) expect(r.corners.some((p) => Math.hypot(p[0] - c[0], p[1] - c[1]) < 4)).toBe(true);
  });

  it("is not confident on a blank photo", () => {
    const W = 200, H = 150;
    expect(findWallInImage({ data: new Uint8ClampedArray(W * H * 4).fill(200), width: W, height: H }).confident).toBe(false);
  });
});
