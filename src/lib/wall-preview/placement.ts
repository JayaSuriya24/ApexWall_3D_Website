// Pure placement logic for the wall preview: where the artwork goes, how it covers or
// fits the marked wall, and how big it is in real units. Coordinates are wall-photo pixels.
import {
  applyHomography,
  centroid,
  isConvexQuad,
  quadDimensions,
  quadSize,
  rectQuad,
  solveHomography,
  type Point,
  type Quad,
  type Rect,
} from "./geometry";
import type { ShapeId } from "./shapes";

export interface Size {
  width: number;
  height: number;
}

/** Everything a placement step can change; one undo step restores all of it. */
export interface Placement {
  artQuad: Quad | null;
  wallQuad: Quad | null;
  /** Part of the artwork shown (artwork pixels) when it's trimmed to cover a wall. */
  artCrop: Rect | null;
  shape: ShapeId;
}

export const EMPTY_PLACEMENT: Placement = { artQuad: null, wallQuad: null, artCrop: null, shape: "rect" };

export const clampPoint = ([x, y]: Point, photo: Size): Point => [
  Math.min(Math.max(x, 0), photo.width),
  Math.min(Math.max(y, 0), photo.height),
];

export const inPhoto = ([x, y]: Point, photo: Size) =>
  x >= -0.5 && y >= -0.5 && x <= photo.width + 0.5 && y <= photo.height + 0.5;

/** Moves a quad, stopping at the photo edges. */
export function translateQuad(q: Quad, dx: number, dy: number, photo: Size): Quad {
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
  dx = Math.min(Math.max(dx, -Math.min(...xs)), photo.width - Math.max(...xs));
  dy = Math.min(Math.max(dy, -Math.min(...ys)), photo.height - Math.max(...ys));
  return q.map(([x, y]) => [x + dx, y + dy]) as Quad;
}

/** Scales or rotates about the centre; null if the result would leave the photo or fold over. */
export function transformQuad(q: Quad, fn: (p: Point, c: Point) => Point, photo: Size): Quad | null {
  const c = centroid(q);
  const next = q.map((p) => fn(p, c)) as Quad;
  return next.every((p) => inPhoto(p, photo)) && isConvexQuad(next) ? next : null;
}

export const scaleQuad = (q: Quad, f: number, photo: Size) =>
  transformQuad(q, ([x, y], [cx, cy]) => [cx + (x - cx) * f, cy + (y - cy) * f], photo);

export function rotateQuad(q: Quad, deg: number, photo: Size) {
  const a = (deg * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  return transformQuad(
    q,
    ([x, y], [cx, cy]) => [cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos],
    photo,
  );
}

export function defaultWallQuad(photo: Size): Quad {
  const mx = photo.width * 0.12, my = photo.height * 0.1;
  return [
    [mx, my],
    [photo.width - mx, my],
    [photo.width - mx, photo.height - my * 2.5],
    [mx, photo.height - my * 2.5],
  ];
}

/** The marked wall as a flat rectangle: real feet when known, else proportions from the photo. */
export function wallFrame(wallQuad: Quad | null, wallSizeFt: Size | null): Size | null {
  if (!wallQuad) return null;
  if (wallSizeFt) return wallSizeFt;
  return quadDimensions(wallQuad);
}

/** Centre-crops a rect to the given width/height ratio. */
export function cropToAspect({ x, y, w, h }: Rect, aspect: number): Rect {
  return w / h > aspect
    ? { x: x + (w - h * aspect) / 2, y, w: h * aspect, h }
    : { x, y: y + (h - w / aspect) / 2, w, h: w / aspect };
}

/** Size of the artwork in wall units (feet when wallSizeFt is given). */
export function measureArt(artQuad: Quad | null, wallQuad: Quad | null, wallSizeFt: Size | null): Size | null {
  if (!artQuad || !wallQuad || !wallSizeFt) return null;
  const H = solveHomography(wallQuad, rectQuad(wallSizeFt.width, wallSizeFt.height));
  return H ? quadSize(H, artQuad) : null;
}

/** Artwork centred on the marked wall at a real-world width, or null if it doesn't fit. */
export function artQuadFromFt(widthFt: number, artAspect: number, wallQuad: Quad, wallSizeFt: Size, photo: Size): Quad | null {
  const { width: W, height: Hft } = wallSizeFt;
  const heightFt = widthFt / artAspect;
  if (widthFt > W + 1e-6 || heightFt > Hft + 1e-6) return null;
  const H = solveHomography(rectQuad(W, Hft), wallQuad);
  if (!H) return null;
  const x0 = (W - widthFt) / 2, y0 = (Hft - heightFt) / 2;
  return rectQuad(widthFt, heightFt).map(([x, y]) => clampPoint(applyHomography(H, [x0 + x, y0 + y]), photo)) as Quad;
}

/** Widest the artwork can be (in feet) and still fit inside the wall. */
export const maxFitWidthFt = (artAspect: number, wallSizeFt: Size) =>
  Math.min(wallSizeFt.width, wallSizeFt.height * artAspect);

/** Starting position: on the measured wall if possible, else centred a little above middle. */
export function defaultArtQuad(photo: Size, artAspect: number, wallQuad: Quad | null, wallSizeFt: Size | null): Quad {
  if (wallQuad && wallSizeFt) {
    const q = artQuadFromFt(maxFitWidthFt(artAspect, wallSizeFt) * 0.6, artAspect, wallQuad, wallSizeFt, photo);
    if (q) return q;
  }
  let w = photo.width * 0.45, h = w / artAspect;
  if (h > photo.height * 0.7) {
    h = photo.height * 0.7;
    w = h * artAspect;
  }
  const x = (photo.width - w) / 2, y = (photo.height - h) / 2.4; // where art usually hangs
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

/**
 * A circle must be round on the real wall: square up the artwork's placement, in the
 * wall's proportions when the wall is marked, keeping its centre.
 */
export function squaredArtQuad(artQuad: Quad, wallQuad: Quad | null, frame: Size | null, photo: Size): Quad {
  if (wallQuad && frame) {
    const toWall = solveHomography(wallQuad, rectQuad(frame.width, frame.height));
    const toPhoto = solveHomography(rectQuad(frame.width, frame.height), wallQuad);
    if (toWall && toPhoto) {
      const { width, height } = quadSize(toWall, artQuad);
      const side = Math.min(width, height);
      const [cx, cy] = centroid(artQuad.map((p) => applyHomography(toWall, p)));
      return rectQuad(side, side).map(([x, y]) =>
        clampPoint(applyHomography(toPhoto, [cx - side / 2 + x, cy - side / 2 + y]), photo),
      ) as Quad;
    }
  }
  const { width, height } = quadDimensions(artQuad);
  const side = Math.min(width, height), [cx, cy] = centroid(artQuad);
  return rectQuad(side, side).map(([x, y]) => clampPoint([cx - side / 2 + x, cy - side / 2 + y], photo)) as Quad;
}

/** Nearest snap point within `radius`, else the point itself. */
export function snapPoint(p: Point, targets: readonly Point[] | undefined, radius: number): Point {
  let best: Point | null = null, bestD = radius;
  for (const t of targets ?? []) {
    const d = Math.hypot(t[0] - p[0], t[1] - p[1]);
    if (d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best ? [best[0], best[1]] : p;
}
