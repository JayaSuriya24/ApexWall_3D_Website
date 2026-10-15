"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  applyHomography,
  isConvexQuad,
  rectCorners,
  solveHomography,
  toCssMatrix3d,
  type Point,
  type Quad,
  type Rect,
} from "@/lib/wall-preview/geometry";
import type { LoadedImage } from "@/lib/wall-preview/image";
import { clampPoint, snapPoint, translateQuad, type Placement } from "@/lib/wall-preview/placement";
import { getShape, shapePoints, toPathD } from "@/lib/wall-preview/shapes";
import type { Blend } from "@/lib/wall-preview/export";

const CORNER_NAMES = ["Top-left", "Top-right", "Bottom-right", "Bottom-left"];
const ARROWS: Record<string, Point> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
/** On-screen distance at which a wall corner snaps to a detected corner. */
const SNAP_RADIUS_PX = 14;

type QuadKey = "artQuad" | "wallQuad";

interface Drag {
  key: QuadKey;
  index: number | null; // null = moving the whole artwork
  pointerId: number;
  start: Point;
  orig: Quad;
  before: Placement;
  last: Placement | null;
}

export interface PreviewStageProps {
  wall: LoadedImage;
  art: LoadedImage | null;
  placement: Placement;
  sourceRect: Rect | null;
  mode: "art" | "wall";
  blend: Blend;
  opacity: number;
  /** Divider position (%) while comparing before/after, else null. */
  comparePos: number | null;
  bannerVisible: boolean;
  snapTargets?: Point[];
  onLive: (next: Placement) => void;
  onCommit: (next: Placement, before?: Placement) => void;
  onWallDragStart: () => void;
  onScale: (factor: number) => void;
  onRotate: (deg: number) => void;
}

export function PreviewStage({
  wall,
  art,
  placement,
  sourceRect,
  mode,
  blend,
  opacity,
  comparePos,
  bannerVisible,
  snapTargets,
  onLive,
  onCommit,
  onWallDragStart,
  onScale,
  onRotate,
}: PreviewStageProps) {
  const fitRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [box, setBox] = useState({ width: 0, viewportW: 0, viewportH: 0 });
  const [dragging, setDragging] = useState<string | null>(null);

  // Fit the photo to the available width and a share of the viewport height.
  useEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const measure = () =>
      setBox({ width: el.clientWidth, viewportW: window.innerWidth, viewportH: window.innerHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const maxHeight = Math.max(260, box.viewportH * (box.viewportW < 1024 ? 0.55 : 0.72));
  const scale = box.width ? Math.min(box.width / wall.width, maxHeight / wall.height) : 0;
  const photo = { width: wall.width, height: wall.height };
  const toDisplay = (q: readonly Point[]) => q.map(([x, y]) => [x * scale, y * scale] as Point);
  const points = (q: readonly Point[]) => toDisplay(q).map((p) => p.join(",")).join(" ");

  const editingWall = mode === "wall";
  const comparing = comparePos !== null;
  const showHandles = !comparing;
  const { artQuad, wallQuad } = placement;

  const H = art && artQuad && sourceRect && scale ? solveHomography(rectCorners(sourceRect), toDisplay(artQuad)) : null;
  const outline = art && sourceRect ? shapePoints(getShape(placement.shape), sourceRect) : null;

  const toImage = (e: React.PointerEvent): Point => {
    const r = stageRef.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale];
  };

  function startDrag(e: React.PointerEvent<HTMLElement>, key: QuadKey, index: number | null) {
    if (e.button > 0) return;
    const quad = placement[key];
    if (!quad) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus({ preventScroll: true });
    drag.current = { key, index, pointerId: e.pointerId, start: toImage(e), orig: quad, before: placement, last: null };
    setDragging(`${key}-${index}`);
    if (key === "wallQuad") onWallDragStart();
  }

  function moveDrag(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const [px, py] = toImage(e);
    const dx = px - d.start[0], dy = py - d.start[1];
    let next: Quad;
    if (d.index === null) {
      next = translateQuad(d.orig, dx, dy, photo);
    } else {
      next = d.orig.map((p) => [p[0], p[1]]) as Quad;
      let pt = clampPoint([d.orig[d.index][0] + dx, d.orig[d.index][1] + dy], photo);
      // Snap wall corners to detected corners; Alt/Option drags freely.
      if (d.key === "wallQuad" && !e.altKey) pt = snapPoint(pt, snapTargets, SNAP_RADIUS_PX / scale);
      next[d.index] = pt;
    }
    if (!isConvexQuad(next)) return;
    d.last = { ...d.before, [d.key]: next };
    onLive(d.last);
  }

  function endDrag(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    setDragging(null);
    if (d.last) onCommit(d.last, d.before);
  }

  function nudge(e: React.KeyboardEvent, key: QuadKey, index: number | null) {
    const quad = placement[key];
    const dir = ARROWS[e.key];
    if (!quad || !dir) return false;
    e.preventDefault();
    const step = (e.shiftKey ? 10 : 1) / scale;
    let next: Quad;
    if (index === null) {
      next = translateQuad(quad, dir[0] * step, dir[1] * step, photo);
    } else {
      next = quad.map((p) => [p[0], p[1]]) as Quad;
      next[index] = clampPoint([quad[index][0] + dir[0] * step, quad[index][1] + dir[1] * step], photo);
    }
    if (isConvexQuad(next)) onCommit({ ...placement, [key]: next });
    return true;
  }

  const handleProps = (key: QuadKey, index: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => startDrag(e, key, index),
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onKeyDown: (e: React.KeyboardEvent) => nudge(e, key, index),
  });

  const handles = (key: QuadKey, quad: Quad | null, visible: boolean, tone: "art" | "wall") =>
    visible &&
    quad &&
    quad.map((p, i) => (
      <button
        key={`${key}-${i}`}
        type="button"
        aria-label={`${CORNER_NAMES[i]} corner of the ${tone === "art" ? "artwork" : "wall"}. Use arrow keys to move.`}
        className={cn(
          "group absolute z-30 -ml-[22px] -mt-[22px] flex h-11 w-11 touch-none items-center justify-center rounded-full outline-none",
          dragging === `${key}-${i}` ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ left: p[0] * scale, top: p[1] * scale }}
        {...handleProps(key, i)}
      >
        <span
          className={cn(
            "block h-[18px] w-[18px] rounded-full border-[3px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform group-focus-visible:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-foreground",
            tone === "art" ? "border-primary" : "border-success",
            dragging === `${key}-${i}` && "scale-125",
          )}
        />
      </button>
    ));

  return (
    <div ref={fitRef} className="relative w-full">
      {scale > 0 && (
        <div
          ref={stageRef}
          className="relative mx-auto touch-none select-none isolate"
          style={{ width: wall.width * scale, height: wall.height * scale }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
          <img
            src={wall.url}
            alt="Your wall photo"
            draggable={false}
            className="block h-full w-full max-w-none rounded-xl"
          />

          {art && H && sourceRect && (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
              style={{
                mixBlendMode: blend,
                opacity,
                clipPath: comparing ? `inset(0 0 0 ${comparePos}%)` : undefined,
              }}
            >
              {/* A trimmed (covering) design overflows its quad, so clip it to the quad. */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  clipPath: placement.artCrop
                    ? `polygon(${toDisplay(artQuad!).map(([x, y]) => `${x}px ${y}px`).join(",")})`
                    : undefined,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                <img
                  src={art.url}
                  alt=""
                  draggable={false}
                  tabIndex={editingWall || comparing ? -1 : 0}
                  aria-label="Artwork. Arrow keys move it, plus and minus resize, [ and ] rotate."
                  className={cn(
                    "absolute left-0 top-0 block max-w-none origin-top-left outline-none will-change-transform",
                    editingWall || comparing ? "pointer-events-none" : "pointer-events-auto cursor-move",
                  )}
                  style={{
                    width: art.width,
                    height: art.height,
                    transform: toCssMatrix3d(H),
                    // clip-path applies before the transform, so the shape warps with the artwork.
                    clipPath: outline ? `path("${toPathD(outline)}")` : undefined,
                  }}
                  onPointerDown={(e) => startDrag(e, "artQuad", null)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(e) => {
                    if (nudge(e, "artQuad", null)) return;
                    if (e.key === "+" || e.key === "=") onScale(1.05);
                    else if (e.key === "-") onScale(1 / 1.05);
                    else if (e.key === "[") onRotate(-2);
                    else if (e.key === "]") onRotate(2);
                  }}
                />
              </div>
            </div>
          )}

          <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden="true">
            {showHandles && editingWall && wallQuad && (
              <polygon points={points(wallQuad)} className="fill-success/15 stroke-success" strokeWidth={2} />
            )}
            {showHandles && !editingWall && artQuad && (
              <polygon points={points(artQuad)} className="fill-none stroke-primary" strokeWidth={2} strokeDasharray="6 5" />
            )}
            {showHandles && !editingWall && outline && H && (
              <polygon
                points={outline.map((pt) => applyHomography(H, pt).join(",")).join(" ")}
                className="fill-none stroke-primary"
                strokeWidth={2}
              />
            )}
          </svg>

          {handles("artQuad", artQuad, Boolean(art) && showHandles && !editingWall, "art")}
          {handles("wallQuad", wallQuad, showHandles && editingWall, "wall")}

          {comparing && (
            <div
              className="pointer-events-none absolute inset-y-0 z-30 w-0.5 -ml-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
              style={{ left: `${comparePos}%` }}
            >
              <span className="absolute right-2 top-2 whitespace-nowrap rounded-full bg-foreground/70 px-2 py-0.5 text-xs font-semibold text-white">
                Before
              </span>
              <span className="absolute left-2 top-2 whitespace-nowrap rounded-full bg-foreground/70 px-2 py-0.5 text-xs font-semibold text-white">
                After
              </span>
            </div>
          )}

          <div
            role="status"
            className={cn(
              "pointer-events-none absolute left-1/2 top-3 z-40 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-foreground px-4 py-1.5 text-center text-xs font-medium text-white shadow-lg transition-opacity duration-300 sm:text-sm",
              editingWall && bannerVisible ? "opacity-100" : "opacity-0",
            )}
          >
            Drag the green corners onto your wall, then press <strong>Cover wall</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
