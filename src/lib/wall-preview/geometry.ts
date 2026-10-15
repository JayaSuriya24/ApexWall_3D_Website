// Perspective (projective) transform helpers for the wall preview.
// Points are [x, y]; quads are listed clockwise from the top-left: [tl, tr, br, bl].

export type Point = [number, number];
export type Quad = [Point, Point, Point, Point];
export type Rect = { x: number; y: number; w: number; h: number };
/** Row-major 3×3 matrix. */
export type Homography = number[];

export function rectQuad(width: number, height: number): Quad {
  return [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
}

export const rectCorners = ({ x, y, w, h }: Rect): Quad => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

/** Matrix mapping each src[i] onto dst[i], or null when the points are degenerate. */
export function solveHomography(src: readonly Point[], dst: readonly Point[]): Homography | null {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  const h = gaussianSolve(A, b);
  if (!h) return null;
  const H = [...h, 1];
  // A (near-)zero determinant flattens the image to a line.
  const det =
    H[0] * (H[4] * H[8] - H[5] * H[7]) - H[1] * (H[3] * H[8] - H[5] * H[6]) + H[2] * (H[3] * H[7] - H[4] * H[6]);
  return Math.abs(det) < 1e-9 ? null : H;
}

function gaussianSolve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null;
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

export function applyHomography(H: Homography, [x, y]: Point): Point {
  const w = H[6] * x + H[7] * y + H[8];
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

/** CSS matrix3d() is column-major. Use with `transform-origin: 0 0`. */
export function toCssMatrix3d(H: Homography): string {
  const [a, b, c, d, e, f, g, h, i] = H;
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,${i})`;
}

/** True when the four points form a convex, non-self-intersecting quad. */
export function isConvexQuad(q: readonly Point[]): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = q[i];
    const [bx, by] = q[(i + 1) % 4];
    const [cx, cy] = q[(i + 2) % 4];
    const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (Math.abs(cross) < 1e-6) return false;
    const s = Math.sign(cross);
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

export const distance = ([ax, ay]: Point, [bx, by]: Point) => Math.hypot(bx - ax, by - ay);

export const centroid = (q: readonly Point[]): Point => [
  q.reduce((s, p) => s + p[0], 0) / q.length,
  q.reduce((s, p) => s + p[1], 0) / q.length,
];

/** Average width/height of a quad in its own units. */
export function quadDimensions([tl, tr, br, bl]: Quad) {
  return {
    width: (distance(tl, tr) + distance(bl, br)) / 2,
    height: (distance(tl, bl) + distance(tr, br)) / 2,
  };
}

/** Width/height of a quad after mapping it through H (e.g. photo pixels → wall feet). */
export function quadSize(H: Homography, quad: Quad) {
  return quadDimensions(quad.map((p) => applyHomography(H, p)) as Quad);
}

/** Affine transform [a, b, c, d, e, f] (canvas order) mapping triangle s onto triangle d. */
export function triangleAffine(s0: Point, s1: Point, s2: Point, d0: Point, d1: Point, d2: Point) {
  const u1 = s1[0] - s0[0], v1 = s1[1] - s0[1];
  const u2 = s2[0] - s0[0], v2 = s2[1] - s0[1];
  const x1 = d1[0] - d0[0], y1 = d1[1] - d0[1];
  const x2 = d2[0] - d0[0], y2 = d2[1] - d0[1];
  const det = u1 * v2 - u2 * v1;
  if (Math.abs(det) < 1e-12) return null;
  const a = (x1 * v2 - x2 * v1) / det;
  const c = (x2 * u1 - x1 * u2) / det;
  const b = (y1 * v2 - y2 * v1) / det;
  const d = (y2 * u1 - y1 * u2) / det;
  return [a, b, c, d, d0[0] - a * s0[0] - c * s0[1], d0[1] - b * s0[0] - d * s0[1]] as const;
}

type Vertex = { s: Point; d: Point };

/**
 * Canvas 2D only does affine transforms, so a perspective warp is drawn as a grid
 * of small triangles. `srcRect` selects the part of the source to draw (for cropping).
 */
export function drawWarped(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  srcRect: Rect,
  quad: Quad,
  grid = 20,
) {
  const H = solveHomography(rectCorners(srcRect), quad);
  if (!H) return;
  const pts: Vertex[][] = [];
  for (let j = 0; j <= grid; j++) {
    const row: Vertex[] = [];
    for (let i = 0; i <= grid; i++) {
      const s: Point = [srcRect.x + (srcRect.w * i) / grid, srcRect.y + (srcRect.h * j) / grid];
      row.push({ s, d: applyHomography(H, s) });
    }
    pts.push(row);
  }
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const p00 = pts[j][i], p10 = pts[j][i + 1], p11 = pts[j + 1][i + 1], p01 = pts[j + 1][i];
      drawTriangle(ctx, source, p00, p10, p11);
      drawTriangle(ctx, source, p00, p11, p01);
    }
  }
}

function drawTriangle(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, p0: Vertex, p1: Vertex, p2: Vertex) {
  const m = triangleAffine(p0.s, p1.s, p2.s, p0.d, p1.d, p2.d);
  if (!m) return;
  // Grow the clip slightly so neighbouring triangles overlap and no seams show.
  const [d0, d1, d2] = expandTriangle([p0.d, p1.d, p2.d], 0.75);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0[0], d0[1]);
  ctx.lineTo(d1[0], d1[1]);
  ctx.lineTo(d2[0], d2[1]);
  ctx.closePath();
  ctx.clip();
  ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  // Only sample the part of the source this triangle covers (+ bleed).
  const xs = [p0.s[0], p1.s[0], p2.s[0]];
  const ys = [p0.s[1], p1.s[1], p2.s[1]];
  const sx = Math.max(0, Math.floor(Math.min(...xs)) - 2);
  const sy = Math.max(0, Math.floor(Math.min(...ys)) - 2);
  const ex = Math.min(source.width, Math.ceil(Math.max(...xs)) + 2);
  const ey = Math.min(source.height, Math.ceil(Math.max(...ys)) + 2);
  ctx.drawImage(source, sx, sy, ex - sx, ey - sy, sx, sy, ex - sx, ey - sy);
  ctx.restore();
}

function expandTriangle(tri: Point[], amount: number): Point[] {
  const [cx, cy] = centroid(tri);
  return tri.map(([x, y]) => {
    const len = Math.hypot(x - cx, y - cy) || 1;
    return [x + ((x - cx) / len) * amount, y + ((y - cy) / len) * amount];
  });
}
