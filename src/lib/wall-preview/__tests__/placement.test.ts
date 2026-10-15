import { describe, expect, it } from "vitest";
import { applyHomography, quadDimensions, rectQuad, solveHomography, type Quad } from "../geometry";
import {
  artQuadFromFt,
  cropToAspect,
  defaultArtQuad,
  maxFitWidthFt,
  measureArt,
  rotateQuad,
  scaleQuad,
  snapPoint,
  squaredArtQuad,
  translateQuad,
} from "../placement";

const photo = { width: 1600, height: 1100 };
const wall: Quad = [[160, 132], [1552, 22], [1552, 1023], [160, 858]]; // angled wall
const wallFt = { width: 14, height: 9 };

describe("placement", () => {
  it("places artwork at a real width and measures it back", () => {
    const q = artQuadFromFt(6, 1.5, wall, wallFt, photo)!;
    const size = measureArt(q, wall, wallFt)!;
    expect(size.width).toBeCloseTo(6, 3);
    expect(size.height).toBeCloseTo(4, 3);
  });

  it("refuses artwork larger than the wall and knows the max fit", () => {
    expect(artQuadFromFt(20, 1.5, wall, wallFt, photo)).toBeNull();
    expect(maxFitWidthFt(1, wallFt)).toBe(9);
    expect(maxFitWidthFt(3, wallFt)).toBe(14);
  });

  it("starts on the measured wall at 60% of the max fit", () => {
    const size = measureArt(defaultArtQuad(photo, 1, wall, wallFt), wall, wallFt)!;
    expect(size.width).toBeCloseTo(9 * 0.6, 3);
  });

  it("keeps the artwork's proportions when no wall is marked", () => {
    const { width, height } = quadDimensions(defaultArtQuad(photo, 2, null, null));
    expect(width / height).toBeCloseTo(2, 6);
  });

  it("squares a circle in real wall units", () => {
    const art = artQuadFromFt(10, 10 / 6, wall, wallFt, photo)!;
    const size = measureArt(squaredArtQuad(art, wall, wallFt, photo), wall, wallFt)!;
    expect(size.width).toBeCloseTo(6, 3);
    expect(size.height).toBeCloseTo(6, 3);
  });

  it("crops to cover without stretching", () => {
    expect(cropToAspect({ x: 0, y: 0, w: 2000, h: 2000 }, 2)).toEqual({ x: 0, y: 500, w: 2000, h: 1000 });
    expect(cropToAspect({ x: 0, y: 0, w: 3000, h: 1000 }, 1)).toEqual({ x: 1000, y: 0, w: 1000, h: 1000 });
  });

  it("stops moves at the photo edge and rejects transforms that leave it", () => {
    const q: Quad = [[10, 10], [110, 10], [110, 60], [10, 60]];
    expect(translateQuad(q, -50, 0, photo)[0][0]).toBe(0);
    expect(scaleQuad(q, 100, photo)).toBeNull();
    expect(scaleQuad(q, 0.5, photo)).not.toBeNull();
    expect(rotateQuad(q, 90, photo)).toBeNull(); // would poke above the photo
  });

  it("snaps to the nearest corner within the radius only", () => {
    expect(snapPoint([100, 100], [[105, 103], [200, 200]], 10)).toEqual([105, 103]);
    expect(snapPoint([100, 100], [[150, 150]], 10)).toEqual([100, 100]);
  });

  it("covers the wall: art quad equals the wall in feet", () => {
    const H = solveHomography(wall, rectQuad(14, 9))!;
    expect(applyHomography(H, wall[2])[0]).toBeCloseTo(14, 6);
  });
});
