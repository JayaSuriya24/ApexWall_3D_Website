// Print-area shapes. Each returns outline points in pixels for a w×h box. The artwork is
// clipped to this outline *before* the perspective warp, so shapes follow the wall's angle.
import type { Point, Rect } from "./geometry";

export type ShapeId = "rect" | "rounded" | "circle" | "oval" | "arch" | "hexagon" | "diamond";

export interface Shape {
  id: ShapeId;
  label: string;
  /** Circle squares up the placement so it stays round on the real wall. */
  square?: boolean;
  points: ((w: number, h: number) => Point[]) | null;
}

const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): Point[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

const ellipse = (w: number, h: number) => arc(w / 2, h / 2, w / 2, h / 2, 0, Math.PI * 2, 96).slice(0, -1);

export const SHAPES: Shape[] = [
  { id: "rect", label: "Rectangle", points: null },
  {
    id: "rounded",
    label: "Rounded",
    points: (w, h) => {
      const r = Math.min(w, h) * 0.14;
      return [
        ...arc(w - r, r, r, r, -Math.PI / 2, 0, 12),
        ...arc(w - r, h - r, r, r, 0, Math.PI / 2, 12),
        ...arc(r, h - r, r, r, Math.PI / 2, Math.PI, 12),
        ...arc(r, r, r, r, Math.PI, Math.PI * 1.5, 12),
      ];
    },
  },
  { id: "circle", label: "Circle", square: true, points: ellipse },
  { id: "oval", label: "Oval", points: ellipse },
  {
    id: "arch",
    label: "Arch",
    points: (w, h) => {
      const ry = Math.min(w / 2, h);
      return [[0, h], ...arc(w / 2, ry, w / 2, ry, Math.PI, Math.PI * 2, 48), [w, h]];
    },
  },
  {
    id: "hexagon",
    label: "Hexagon",
    points: (w, h) => [[0, h / 2], [w / 4, 0], [(3 * w) / 4, 0], [w, h / 2], [(3 * w) / 4, h], [w / 4, h]],
  },
  { id: "diamond", label: "Diamond", points: (w, h) => [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]] },
];

export const getShape = (id: string): Shape => SHAPES.find((s) => s.id === id) ?? SHAPES[0];

/** Share of the bounding box that gets printed (1 for a rectangle, ≈0.785 for a circle). */
export function shapeFillRatio(shape: Shape, w = 1, h = 1): number {
  if (!shape.points) return 1;
  const pts = shape.points(w, h);
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2 / (w * h);
}

/** Outline points for a source rect, in that rect's coordinate space. */
export function shapePoints(shape: Shape, { x, y, w, h }: Rect): Point[] | null {
  return shape.points ? shape.points(w, h).map(([px, py]) => [x + px, y + py] as Point) : null;
}

export const toPathD = (pts: Point[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
