// Finds the main wall in a room photo with classic edge + straight-line detection
// (Sobel edges and dark creases → Hough transform → best-scoring quad). No AI model;
// runs in the browser in ~100 ms. The customer can always adjust the corners afterwards.
import type { Point, Quad } from "./geometry";

const DEG = Math.PI / 180;
/** How much a photo edge counts as a wall edge (the wall continues out of frame). */
const BORDER_SUPPORT = 0.3;
/** Brightness levels a crease must be darker than both sides. */
const CREASE_MIN = 1.5;

export interface WallDetection {
  quad: Quad | null;
  /** At least two sides are real, well-supported edges (not just the photo border). */
  confident: boolean;
  edgesFound: number;
  /** Line intersections that wall corners can snap to. */
  corners: Point[];
}

interface Line {
  theta: number;
  rho: number;
  c: number;
  s: number;
  pos?: number;
  votes?: number;
  border?: boolean;
}

type ImageDataLike = { data: ArrayLike<number>; width: number; height: number };

export function detectWall(source: HTMLCanvasElement, maxSize = 480): WallDetection {
  const s = Math.min(1, maxSize / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * s));
  canvas.height = Math.max(1, Math.round(source.height * s));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const result = findWallInImage(ctx.getImageData(0, 0, canvas.width, canvas.height));
  // Back to source-image pixels.
  const sx = source.width / canvas.width, sy = source.height / canvas.height;
  const up = ([x, y]: Point): Point => [x * sx, y * sy];
  return {
    ...result,
    quad: result.quad && (result.quad.map(up) as Quad),
    corners: result.corners.map(up),
  };
}

/** Pure function on ImageData-like input so it can be unit-tested. */
export function findWallInImage({ data, width: W, height: H }: ImageDataLike): WallDetection {
  const n = W * H;
  const gray = new Float32Array(n);
  for (let i = 0; i < n; i++) gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  const smooth = blur(gray, W, H);

  // Sobel gradients
  const mag = new Float32Array(n), ang = new Float32Array(n);
  let maxMag = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const a = smooth[i - W - 1], b = smooth[i - W], c = smooth[i - W + 1];
      const d = smooth[i - 1], f = smooth[i + 1];
      const g = smooth[i + W - 1], h = smooth[i + W], k = smooth[i + W + 1];
      const gx = c + 2 * f + k - a - 2 * d - g;
      const gy = g + 2 * h + k - a - 2 * b - c;
      mag[i] = Math.hypot(gx, gy);
      ang[i] = Math.atan2(gy, gx);
      if (mag[i] > maxMag) maxMag = mag[i];
    }
  }
  const sorted = Float32Array.from(mag).sort();
  const threshold = Math.max(sorted[Math.floor(n * 0.75)], maxMag * 0.04, 8);

  // Thin edges with non-maximum suppression
  const edge = new Uint8Array(n);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, m = mag[i];
      if (m < threshold) continue;
      const a = (ang[i] / DEG + 180) % 180;
      const [o1, o2] =
        a < 22.5 || a >= 157.5 ? [-1, 1] : a < 67.5 ? [-W - 1, W + 1] : a < 112.5 ? [-W, W] : [-W + 1, W - 1];
      if (m >= mag[i + o1] && m >= mag[i + o2]) edge[i] = 1;
    }
  }

  // Room corners and ceiling lines often show as thin dark creases (shadow) with the same
  // brightness on both sides, which a step-edge detector misses. Find those as well.
  const creaseV = new Float32Array(n), creaseH = new Float32Array(n);
  for (let y = 4; y < H - 4; y++) {
    for (let x = 4; x < W - 4; x++) {
      const i = y * W + x, c = smooth[i];
      let v = 0, h = 0;
      for (const d of [2, 4]) {
        v = Math.max(v, Math.min(smooth[i - d], smooth[i + d]) - c);
        h = Math.max(h, Math.min(smooth[i - d * W], smooth[i + d * W]) - c);
      }
      creaseV[i] = v;
      creaseH[i] = h;
    }
  }
  const crease = new Uint8Array(n); // 1 = vertical crease, 2 = horizontal crease
  for (let y = 4; y < H - 4; y++) {
    for (let x = 4; x < W - 4; x++) {
      const i = y * W + x, v = creaseV[i], h = creaseH[i];
      if (v >= CREASE_MIN && v >= h && v >= creaseV[i - 1] && v >= creaseV[i + 1]) crease[i] = 1;
      else if (h >= CREASE_MIN && h > v && h >= creaseH[i - W] && h >= creaseH[i + W]) crease[i] = 2;
    }
  }
  const lineMask = new Uint8Array(n);
  for (let i = 0; i < n; i++) lineMask[i] = edge[i] | (crease[i] ? 1 : 0);
  const near = dilate(lineMask, W, H, 2);

  // Hough transform; each edge pixel only votes for angles close to its gradient direction.
  const diag = Math.ceil(Math.hypot(W, H));
  const nRho = diag * 2 + 1;
  const cos = new Float32Array(180), sin = new Float32Array(180);
  for (let t = 0; t < 180; t++) {
    cos[t] = Math.cos(t * DEG);
    sin[t] = Math.sin(t * DEG);
  }
  const acc = new Float32Array(180 * nRho);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (!edge[i]) continue;
      const t0 = Math.round((((ang[i] / DEG) % 180) + 180) % 180);
      for (let d = -6; d <= 6; d++) {
        const t = (t0 + d + 180) % 180;
        acc[t * nRho + Math.round(x * cos[t] + y * sin[t]) + diag] += 1;
      }
    }
  }
  // Creases have no gradient direction, so they vote for every plausible wall-line angle.
  for (let y = 4; y < H - 4; y++) {
    for (let x = 4; x < W - 4; x++) {
      const kind = crease[y * W + x];
      if (!kind) continue;
      const [from, to] = kind === 1 ? [-12, 12] : [50, 130];
      for (let d = from; d <= to; d++) {
        const t = (d + 180) % 180;
        acc[t * nRho + Math.round(x * cos[t] + y * sin[t]) + diag] += 1;
      }
    }
  }

  // Local maxima → candidate lines
  const minVotes = Math.max(15, Math.min(W, H) * 0.12);
  const peaks: { theta: number; rho: number; votes: number }[] = [];
  for (let t = 0; t < 180; t++) {
    for (let r = 0; r < nRho; r++) {
      const v = acc[t * nRho + r];
      if (v < minVotes) continue;
      let isMax = true;
      for (let dt = -3; dt <= 3 && isMax; dt++) {
        const tt = (t + dt + 180) % 180;
        for (let dr = -4; dr <= 4; dr++) {
          const rr = r + dr;
          if (rr < 0 || rr >= nRho || (dt === 0 && dr === 0)) continue;
          if (acc[tt * nRho + rr] > v) {
            isMax = false;
            break;
          }
        }
      }
      if (isMax) peaks.push({ theta: t * DEG, rho: r - diag, votes: v });
    }
  }
  peaks.sort((a, b) => b.votes - a.votes);

  const verticals: Line[] = [], horizontals: Line[] = [];
  for (const p of peaks.slice(0, 80)) {
    const line: Line = { theta: p.theta, rho: p.rho, c: Math.cos(p.theta), s: Math.sin(p.theta), votes: p.votes };
    if (Math.abs(line.s) < Math.sin(12 * DEG)) {
      line.pos = (line.rho - (H / 2) * line.s) / line.c; // x at mid-height
      // A room corner often shows as a crease plus the edges of its shadow; treat lines
      // this close together as one corner and keep the strongest.
      if (!verticals.some((l) => Math.abs(l.pos! - line.pos!) < Math.max(6, W * 0.04))) verticals.push(line);
    } else if (Math.abs(line.c) < Math.sin(40 * DEG)) {
      line.pos = (line.rho - (W / 2) * line.c) / line.s; // y at mid-width
      if (!horizontals.some((l) => Math.abs(l.pos! - line.pos!) < 6)) horizontals.push(line);
    }
  }
  const border = (theta: number, rho: number, pos: number): Line => ({
    theta,
    rho,
    c: Math.cos(theta),
    s: Math.sin(theta),
    pos,
    border: true,
  });
  const vLines = [...verticals.slice(0, 10), border(0, 0, 0), border(0, W - 1, W - 1)];
  const hLines = [...horizontals.slice(0, 10), border(Math.PI / 2, 0, 0), border(Math.PI / 2, H - 1, H - 1)];

  const inside = ([x, y]: Point) => x >= -3 && y >= -3 && x <= W + 2 && y <= H + 2;
  const support = (p: Point, q: Point, line: Line) => (line.border ? BORDER_SUPPORT : segmentSupport(near, W, H, p, q));
  const sidesOf = (q: Quad): [Point, Point][] => [[q[0], q[1]], [q[1], q[2]], [q[3], q[2]], [q[0], q[3]]];

  let best: { quad: Quad; score: number; sup: number[]; lines: Line[] } | null = null;
  for (const L of vLines) {
    for (const R of vLines) {
      if (R.pos! - L.pos! < W * 0.25) continue;
      for (const T of hLines) {
        for (const B of hLines) {
          if (B.pos! - T.pos! < H * 0.2) continue;
          const corners = [intersect(L, T), intersect(R, T), intersect(R, B), intersect(L, B)];
          if (!corners.every((p) => p && inside(p))) continue;
          const quad = corners as Quad;
          const areaFrac = polygonArea(quad) / (W * H);
          if (areaFrac < 0.1) continue;
          const sides = sidesOf(quad);
          const lines = [T, R, B, L];
          const sup = sides.map(([p, q], i) => support(p, q, lines[i]));
          // A real wall edge has wall colour just inside it; a floorboard or skirting line
          // below the true edge has floor colour there. Only top/bottom: beside a room
          // corner the wall is often in shadow, which would push the sides inwards.
          const wallLum = interiorMedian(smooth, W, H, quad);
          const c: Point = [(quad[0][0] + quad[2][0]) / 2, (quad[0][1] + quad[2][1]) / 2];
          const side = sides.map(([p, q], i) =>
            i % 2 ? sup[i] : sup[i] * (0.25 + 0.75 * innerMatch(smooth, W, H, p, q, c, wallLum)),
          );
          const avg = (side[0] + side[1] + side[2] + side[3]) / 4;
          // A painted wall is plain; floors, furniture and ceilings add edges inside the quad.
          const busy = interiorEdgeDensity(lineMask, W, H, quad);
          const score = avg * Math.sqrt(areaFrac) * Math.exp(-busy * 3);
          if (!best || score > best.score) best = { quad, score, sup, lines };
        }
      }
    }
  }

  // Hough lines are only accurate to ~1°, so fit each chosen side to the pixels along it.
  if (best) {
    const sides = sidesOf(best.quad);
    const [T, R, B, L] = best.lines.map((line, i) =>
      line.border ? line : (refineLine(crease, lineMask, W, H, sides[i][0], sides[i][1], i % 2 === 1) ?? line),
    );
    const refined = [intersect(L, T), intersect(R, T), intersect(R, B), intersect(L, B)];
    if (refined.every((pt) => pt && inside(pt))) best.quad = refined as Quad;
  }

  const clampPt = ([x, y]: Point): Point => [Math.min(Math.max(x, 0), W - 1), Math.min(Math.max(y, 0), H - 1)];
  const corners: Point[] = [];
  for (const v of vLines) {
    for (const h of hLines) {
      const p = intersect(v, h);
      if (p && inside(p)) corners.push(clampPt(p));
    }
  }
  const chosen = best;
  const realEdges = chosen ? chosen.sup.filter((s, i) => !chosen.lines[i].border && s >= 0.5).length : 0;
  return {
    quad: chosen ? (chosen.quad.map(clampPt) as Quad) : null,
    confident: realEdges >= 2,
    edgesFound: realEdges,
    corners,
  };
}

// Least-squares fit to line pixels within 3 px of segment p→q. Prefers crease pixels,
// which sit exactly on a room corner, over the edges of its shadow.
function refineLine(
  crease: Uint8Array,
  mask: Uint8Array,
  W: number,
  H: number,
  [x1, y1]: Point,
  [x2, y2]: Point,
  vertical: boolean,
): Line | null {
  const steps = Math.max(10, Math.round(Math.hypot(x2 - x1, y2 - y1)));
  const collect = (test: (i: number) => boolean) => {
    const pts: Point[] = [];
    // Skip the ends, where other lines meet this one at the corners.
    for (let k = Math.round(steps * 0.1); k <= steps * 0.9; k++) {
      const bx = x1 + ((x2 - x1) * k) / steps, by = y1 + ((y2 - y1) * k) / steps;
      for (let off = -3; off <= 3; off++) {
        const x = Math.round(vertical ? bx + off : bx), y = Math.round(vertical ? by : by + off);
        if (x >= 0 && y >= 0 && x < W && y < H && test(y * W + x)) pts.push([x, y]);
      }
    }
    return pts;
  };
  let pts = collect((i) => crease[i] === (vertical ? 1 : 2));
  if (pts.length < steps * 0.25) pts = collect((i) => mask[i] === 1);
  if (pts.length < steps * 0.25) return null;
  // vertical: x = a·y + b, otherwise y = a·x + b
  const fit = (pp: Point[]) => {
    const u = pp.map(([x, y]) => (vertical ? y : x)), v = pp.map(([x, y]) => (vertical ? x : y));
    const m = u.length, mu = u.reduce((s, t) => s + t) / m, mv = v.reduce((s, t) => s + t) / m;
    let suu = 0, suv = 0;
    for (let k = 0; k < m; k++) {
      suu += (u[k] - mu) ** 2;
      suv += (u[k] - mu) * (v[k] - mv);
    }
    if (suu === 0) return null;
    const a = suv / suu;
    return { a, b: mv - a * mu };
  };
  let f = fit(pts);
  if (!f) return null;
  // One pass of outlier rejection: stray pixels near faint lines can tilt the fit.
  const first = f;
  const kept = pts.filter(([x, y]) => Math.abs((vertical ? x : y) - (first.a * (vertical ? y : x) + first.b)) <= 1.5);
  if (kept.length >= pts.length * 0.4) f = fit(kept) ?? f;
  // Convert to normal form x·cosθ + y·sinθ = ρ
  let nx = vertical ? 1 : -f.a, ny = vertical ? -f.a : 1;
  const norm = Math.hypot(nx, ny);
  nx /= norm;
  ny /= norm;
  return { theta: Math.atan2(ny, nx), rho: f.b / norm, c: nx, s: ny };
}

function intersect(a: Line, b: Line): Point | null {
  const det = a.c * b.s - a.s * b.c;
  if (Math.abs(det) < 1e-6) return null;
  return [(a.rho * b.s - a.s * b.rho) / det, (a.c * b.rho - a.rho * b.c) / det];
}

const lerpQuad = ([tl, tr, br, bl]: Quad, u: number, v: number): Point => [
  (1 - v) * ((1 - u) * tl[0] + u * tr[0]) + v * ((1 - u) * bl[0] + u * br[0]),
  (1 - v) * ((1 - u) * tl[1] + u * tr[1]) + v * ((1 - u) * bl[1] + u * br[1]),
];

function interiorMedian(lum: Float32Array, W: number, H: number, quad: Quad) {
  const vals: number[] = [];
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 10; i++) {
      const [x, y] = lerpQuad(quad, 0.15 + (0.7 * i) / 9, 0.15 + (0.7 * j) / 9);
      const xi = Math.round(x), yi = Math.round(y);
      if (xi >= 0 && yi >= 0 && xi < W && yi < H) vals.push(lum[yi * W + xi]);
    }
  }
  vals.sort((a, b) => a - b);
  return vals.length ? vals[vals.length >> 1] : 0;
}

/** Fraction of points just inside edge p→q whose brightness matches the wall. */
function innerMatch(
  lum: Float32Array,
  W: number,
  H: number,
  [x1, y1]: Point,
  [x2, y2]: Point,
  [cx, cy]: Point,
  wallLum: number,
  offset = 4,
) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  let nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  if (nx * (cx - x1) + ny * (cy - y1) < 0) {
    nx = -nx;
    ny = -ny;
  }
  const tol = Math.max(14, wallLum * 0.15);
  let hit = 0, total = 0;
  for (let k = 1; k < 24; k++) {
    const t = k / 24;
    const x = Math.round(x1 + (x2 - x1) * t + nx * offset), y = Math.round(y1 + (y2 - y1) * t + ny * offset);
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    total++;
    if (Math.abs(lum[y * W + x] - wallLum) <= tol) hit++;
  }
  return total ? hit / total : 0;
}

function polygonArea(q: Point[]) {
  let a = 0;
  for (let i = 0; i < q.length; i++) {
    const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % q.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Fraction of points along p→q that lie on (or within 2 px of) an edge. */
function segmentSupport(near: Uint8Array, W: number, H: number, [x1, y1]: Point, [x2, y2]: Point) {
  const steps = Math.max(10, Math.round(Math.hypot(x2 - x1, y2 - y1) / 2));
  let hit = 0, total = 0;
  for (let k = 0; k <= steps; k++) {
    const x = Math.round(x1 + ((x2 - x1) * k) / steps), y = Math.round(y1 + ((y2 - y1) * k) / steps);
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    total++;
    hit += near[y * W + x];
  }
  return total ? hit / total : 0;
}

function interiorEdgeDensity(edge: Uint8Array, W: number, H: number, quad: Quad) {
  const N = 22;
  let hits = 0, total = 0;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const [fx, fy] = lerpQuad(quad, 0.06 + (0.88 * i) / (N - 1), 0.06 + (0.88 * j) / (N - 1));
      const x = Math.round(fx), y = Math.round(fy);
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      total++;
      // 3×3 neighbourhood so thin edges aren't missed between samples
      const i0 = y * W + x;
      hits += edge[i0] | edge[i0 - 1] | edge[i0 + 1] | edge[i0 - W] | edge[i0 + W] ? 1 : 0;
    }
  }
  return total ? hits / total : 0;
}

function blur(src: Float32Array, W: number, H: number) {
  const k = [1, 4, 6, 4, 1];
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let d = -2; d <= 2; d++) s += k[d + 2] * src[y * W + Math.min(W - 1, Math.max(0, x + d))];
      tmp[y * W + x] = s / 16;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let d = -2; d <= 2; d++) s += k[d + 2] * tmp[Math.min(H - 1, Math.max(0, y + d)) * W + x];
      out[y * W + x] = s / 16;
    }
  }
  return out;
}

function dilate(mask: Uint8Array, W: number, H: number, r: number) {
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < W) out[yy * W + xx] = 1;
        }
      }
    }
  }
  return out;
}
