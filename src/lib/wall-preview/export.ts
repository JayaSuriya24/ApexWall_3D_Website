// Builds the downloadable mockup and the WhatsApp summary for the wall preview.
import { drawWarped, type Quad, type Rect } from "./geometry";
import { canvasToBlob, type LoadedImage } from "./image";
import { estimatePrice, formatInr, type Ink, type Surface } from "./pricing";
import { getShape, shapeFillRatio, shapePoints, toPathD, type ShapeId } from "./shapes";
import type { Size } from "./placement";

export type Blend = "multiply" | "normal";

export async function exportMockup({
  wall,
  art,
  artQuad,
  sourceRect,
  shape,
  blend,
  opacity,
}: {
  wall: LoadedImage;
  art: LoadedImage;
  artQuad: Quad;
  sourceRect: Rect;
  shape: ShapeId;
  blend: Blend;
  opacity: number;
}): Promise<Blob> {
  const { width, height } = wall;
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(wall.canvas, 0, 0);

  // Cut the shape out of the artwork first, so it is warped along with it.
  let source = art.canvas;
  const outline = shapePoints(getShape(shape), sourceRect);
  if (outline) {
    source = document.createElement("canvas");
    source.width = art.width;
    source.height = art.height;
    const sctx = source.getContext("2d")!;
    sctx.clip(new Path2D(toPathD(outline)));
    sctx.drawImage(art.canvas, 0, 0);
  }

  // Warp onto a separate layer so blending happens once, without seams.
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  drawWarped(layer.getContext("2d")!, source, sourceRect, artQuad);
  ctx.globalCompositeOperation = blend === "multiply" ? "multiply" : "source-over";
  ctx.globalAlpha = opacity;
  ctx.drawImage(layer, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const fontSize = Math.max(12, Math.round(width * 0.013));
  const pad = Math.round(fontSize * 0.7);
  const text = "ApexWall · Visual mockup, not a print proof";
  ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  const bw = ctx.measureText(text).width + pad * 2, bh = fontSize + pad * 2;
  ctx.fillStyle = "rgba(28,26,23,0.65)";
  ctx.beginPath();
  ctx.roundRect(width - bw - pad, height - bh - pad, bw, bh, bh / 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width - bw, height - pad - bh / 2);

  return canvasToBlob(out, "image/jpeg", 0.88);
}

export function summaryText({
  artTitle,
  ownArtwork,
  wallSizeFt,
  artSizeFt,
  shape,
  surface,
  ink,
}: {
  artTitle?: string;
  ownArtwork?: boolean;
  wallSizeFt: Size | null;
  artSizeFt: Size | null;
  shape: ShapeId;
  surface: Surface;
  ink: Ink;
}) {
  const lines = ["Hi ApexWall! I made a mockup with your Wall Preview."];
  if (artTitle) lines.push(`Design: ${artTitle}${ownArtwork ? " (my own artwork)" : ""}`);
  if (wallSizeFt && artSizeFt) {
    const s = getShape(shape);
    const est = estimatePrice({
      widthFt: artSizeFt.width,
      heightFt: artSizeFt.height,
      surface,
      ink,
      fillRatio: shapeFillRatio(s, artSizeFt.width, artSizeFt.height),
    });
    lines.push(
      `Wall: ${wallSizeFt.width} × ${wallSizeFt.height} ft`,
      `Artwork: approx. ${artSizeFt.width.toFixed(1)} × ${artSizeFt.height.toFixed(1)} ft${
        s.points ? `, ${s.label.toLowerCase()} shape` : ""
      } (${est.areaSqFt.toFixed(0)} sq ft printed)`,
      `Surface: ${surface}`,
      `Ink: ${ink}`,
      `Online estimate: ${formatInr(est.total)}`,
    );
  }
  lines.push("I'll attach my mockup image here.");
  return lines.join("\n");
}
