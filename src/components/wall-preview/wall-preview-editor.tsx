"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Download,
  ImagePlus,
  Lock,
  Maximize,
  Minus,
  Plus,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  ScanLine,
  Share2,
  SplitSquareHorizontal,
  Undo2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { PillButton } from "@/components/ui/pill-button";
import { PreviewStage } from "./preview-stage";
import { isConvexQuad, type Quad, type Rect } from "@/lib/wall-preview/geometry";
import {
  ACCEPT_ATTR,
  imageFromCanvas,
  loadImageFile,
  loadImageUrl,
  validateImageFile,
  type LoadedImage,
} from "@/lib/wall-preview/image";
import {
  artQuadFromFt,
  cropToAspect,
  defaultArtQuad,
  defaultWallQuad,
  EMPTY_PLACEMENT,
  maxFitWidthFt,
  measureArt,
  rotateQuad,
  scaleQuad,
  squaredArtQuad,
  wallFrame,
  type Placement,
} from "@/lib/wall-preview/placement";
import { detectWall, type WallDetection } from "@/lib/wall-preview/wall-detect";
import { DESIGNS, SAMPLE_ROOMS, renderDesign } from "@/lib/wall-preview/designs";
import { getShape, SHAPES, shapeFillRatio, toPathD, type ShapeId } from "@/lib/wall-preview/shapes";
import {
  estimatePrice,
  formatInr,
  INKS,
  printPpi,
  resolutionVerdict,
  SURFACES,
  type Ink,
  type Surface,
} from "@/lib/wall-preview/pricing";
import { exportMockup, summaryText, type Blend } from "@/lib/wall-preview/export";

const MAX_WALL_EDGE = 2048;
const MAX_ART_EDGE = 2400;
const HISTORY_LIMIT = 50;
const MOBILE_QUERY = "(max-width: 1023px)";

type WallImage = LoadedImage & { name: string };
type ArtImage = LoadedImage & { title: string; source: "catalog" | "upload"; id?: string };

const VERDICT_TEXT = {
  good: "Image resolution looks good for this size.",
  ok: "Resolution is fine when viewed from a few steps away.",
  low: "This image may look blurry at this size. A higher-resolution file would help.",
};

export function WallPreviewEditor() {
  const [wall, setWall] = useState<WallImage | null>(null);
  const [art, setArt] = useState<ArtImage | null>(null);
  const [placement, setPlacement] = useState<Placement>(EMPTY_PLACEMENT);
  const [history, setHistory] = useState<Placement[]>([]);
  const [detection, setDetection] = useState<WallDetection | null>(null);
  const [mode, setMode] = useState<"art" | "wall">("art");
  const [blend, setBlend] = useState<Blend>("multiply");
  const [opacity, setOpacity] = useState(0.92);
  const [comparePos, setComparePos] = useState<number | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [wallInput, setWallInput] = useState({ width: "", height: "" });
  // null = show the measured width; a string while the customer is typing
  const [artWidthInput, setArtWidthInput] = useState<string | null>(null);
  const [surface, setSurface] = useState<Surface>(SURFACES[0]);
  const [ink, setInk] = useState<Ink>(INKS[0]);
  const [artTab, setArtTab] = useState<"designs" | "upload">("designs");
  const [errors, setErrors] = useState<{ wall?: string; art?: string }>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const stageCardRef = useRef<HTMLDivElement>(null);

  const [thumbs] = useState(() => Object.fromEntries(DESIGNS.map((d) => [d.id, renderDesign(d, 240).toDataURL("image/png")])));
  const [canShareFiles] = useState(() => {
    try {
      return Boolean(navigator.canShare?.({ files: [new File([""], "x.jpg", { type: "image/jpeg" })] }));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!bannerVisible) return;
    const t = setTimeout(() => setBannerVisible(false), 4000);
    return () => clearTimeout(t);
  }, [bannerVisible]);

  // A new id restarts the timer even when the same message repeats.
  const notify = (message: string) => setToast((t) => ({ id: (t?.id ?? 0) + 1, message }));

  // ---------- derived values ----------

  const photo = wall && { width: wall.width, height: wall.height };
  const wallSizeFt = useMemo(() => {
    const width = parseFloat(wallInput.width), height = parseFloat(wallInput.height);
    return width > 0 && height > 0 ? { width, height } : null;
  }, [wallInput]);
  const measured = Boolean(placement.wallQuad && wallSizeFt);
  const sourceRect: Rect | null = art && (placement.artCrop ?? { x: 0, y: 0, w: art.width, h: art.height });
  const artSize = measureArt(placement.artQuad, placement.wallQuad, wallSizeFt);
  const shape = getShape(placement.shape);
  const estimate =
    artSize &&
    estimatePrice({
      widthFt: artSize.width,
      heightFt: artSize.height,
      surface,
      ink,
      fillRatio: shapeFillRatio(shape, artSize.width, artSize.height),
    });
  const ppi = art && sourceRect && artSize ? printPpi((art.originalWidth * sourceRect.w) / art.width, artSize.width) : null;
  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    summaryText({
      artTitle: art?.title,
      ownArtwork: art?.source === "upload",
      wallSizeFt,
      artSizeFt: artSize,
      shape: placement.shape,
      surface,
      ink,
    }),
  )}`;

  // ---------- history ----------

  function commit(next: Placement, before: Placement = placement) {
    if ((next.artQuad && !isConvexQuad(next.artQuad)) || (next.wallQuad && !isConvexQuad(next.wallQuad))) {
      notify("That would fold the shape over itself.");
      return false;
    }
    setHistory((h) => [...h.slice(-(HISTORY_LIMIT - 1)), before]);
    setPlacement(next);
    return true;
  }

  function undo() {
    const prev = history.at(-1);
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setPlacement(prev);
  }

  // ---------- loading images ----------

  function scrollStageIntoView() {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      requestAnimationFrame(() => stageCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function applyWall(image: LoadedImage, name: string) {
    if (wall) URL.revokeObjectURL(wall.url);
    setWall({ ...image, name });
    setDetection(null);
    setHistory([]);
    setMode("art");
    setComparePos(null);
    // A new photo invalidates any placement on the old one.
    setPlacement((p) => ({
      ...EMPTY_PLACEMENT,
      shape: p.shape,
      artQuad: art ? defaultArtQuad(image, art.width / art.height, null, null) : null,
    }));
    if (Math.max(image.originalWidth, image.originalHeight) < 800) {
      notify("This photo is quite small, so the preview may look soft.");
    }
  }

  async function handleWallFile(file: File | undefined) {
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.ok) return setErrors((e) => ({ ...e, wall: check.error }));
    setErrors((e) => ({ ...e, wall: undefined }));
    setBusy("wall");
    try {
      applyWall(await loadImageFile(file, MAX_WALL_EDGE), file.name);
    } catch {
      setErrors((e) => ({ ...e, wall: "We couldn't open that image. Please try a different photo." }));
    } finally {
      setBusy(null);
    }
  }

  async function loadSampleRoom(room: (typeof SAMPLE_ROOMS)[number]) {
    setErrors((e) => ({ ...e, wall: undefined }));
    setBusy("wall");
    try {
      applyWall(await loadImageUrl(room.src, MAX_WALL_EDGE), `Sample: ${room.title}`);
    } catch {
      setErrors((e) => ({ ...e, wall: "We couldn't load the sample room. Please try again." }));
    } finally {
      setBusy(null);
    }
  }

  function applyArt(image: LoadedImage, meta: Omit<ArtImage, keyof LoadedImage>) {
    if (!wall || !photo) return;
    if (art && art.url !== image.url) URL.revokeObjectURL(art.url);
    setArt({ ...image, ...meta });
    commit({
      ...placement,
      artCrop: null,
      shape: "rect",
      artQuad: defaultArtQuad(photo, image.width / image.height, placement.wallQuad, wallSizeFt),
    });
    scrollStageIntoView();
  }

  async function handleArtFile(file: File | undefined) {
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.ok) return setErrors((e) => ({ ...e, art: check.error }));
    setErrors((e) => ({ ...e, art: undefined }));
    setBusy("art");
    try {
      applyArt(await loadImageFile(file, MAX_ART_EDGE), { title: file.name, source: "upload" });
    } catch {
      setErrors((e) => ({ ...e, art: "We couldn't open that image. Please try a different file." }));
    } finally {
      setBusy(null);
    }
  }

  async function pickDesign(design: (typeof DESIGNS)[number]) {
    setErrors((e) => ({ ...e, art: undefined }));
    const image = await imageFromCanvas(renderDesign(design), { type: design.type });
    applyArt(image, { title: design.title, source: "catalog", id: design.id });
  }

  function removeWall() {
    if (wall) URL.revokeObjectURL(wall.url);
    setWall(null);
    setDetection(null);
    setPlacement((p) => ({ ...EMPTY_PLACEMENT, shape: p.shape }));
    setHistory([]);
    setMode("art");
  }

  function startOver() {
    if (!window.confirm("Start over? Your current preview will be cleared.")) return;
    if (wall) URL.revokeObjectURL(wall.url);
    if (art) URL.revokeObjectURL(art.url);
    setWall(null);
    setArt(null);
    setPlacement(EMPTY_PLACEMENT);
    setHistory([]);
    setDetection(null);
    setMode("art");
    setComparePos(null);
    setBlend("multiply");
    setOpacity(0.92);
    setWallInput({ width: "", height: "" });
    setArtWidthInput(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- artwork tools ----------

  function scaleArt(f: number) {
    if (!placement.artQuad || !photo) return;
    const q = scaleQuad(placement.artQuad, f, photo);
    if (q) commit({ ...placement, artQuad: q });
    else notify("The artwork has reached the edge of the photo.");
  }

  function rotateArt(deg: number) {
    if (!placement.artQuad || !photo) return;
    const q = rotateQuad(placement.artQuad, deg, photo);
    if (q) commit({ ...placement, artQuad: q });
    else notify("The artwork has reached the edge of the photo.");
  }

  function resetPlacement() {
    if (!art || !photo) return;
    commit({
      ...placement,
      artCrop: null,
      artQuad: defaultArtQuad(photo, art.width / art.height, placement.wallQuad, wallSizeFt),
    });
  }

  function setShape(id: ShapeId) {
    if (!art || !photo || !placement.artQuad || !sourceRect || id === placement.shape) return;
    if (getShape(id).square) {
      const frame = wallFrame(placement.wallQuad, wallSizeFt);
      commit({
        ...placement,
        shape: id,
        artQuad: squaredArtQuad(placement.artQuad, placement.wallQuad, frame, photo),
        artCrop: cropToAspect(sourceRect, 1),
      });
      notify("Circle placed. Drag a corner to resize; use Oval for a stretched shape.");
      return;
    }
    commit({ ...placement, shape: id });
  }

  // ---------- wall marking ----------

  function getDetection() {
    if (detection || !wall) return detection;
    const d = detectWall(wall.canvas);
    setDetection(d);
    return d;
  }

  /** Corners on the detected wall edges, or a default box if none were found. */
  function autoWallQuad(): Quad {
    const d = getDetection();
    if (d?.quad && d.edgesFound >= 1 && isConvexQuad(d.quad)) {
      notify(
        d.confident
          ? "We found your wall's edges. Check the corners and adjust if needed."
          : "We found some of the wall's edges. Please check the corners.",
      );
      return d.quad;
    }
    notify("We couldn't find the wall's edges clearly. Drag the corners into place.");
    return defaultWallQuad(photo!);
  }

  function toggleMarkWall() {
    if (mode === "wall") {
      setMode("art");
      setBannerVisible(false);
      return;
    }
    if (!placement.wallQuad) {
      const wallQuad = autoWallQuad();
      setPlacement((p) => ({ ...p, wallQuad }));
    }
    setMode("wall");
    setComparePos(null);
    setBannerVisible(true);
    // On phones the controls sit below the photo; bring the corners into view.
    scrollStageIntoView();
  }

  function redetect() {
    commit({ ...placement, wallQuad: autoWallQuad() });
    setMode("wall");
    setComparePos(null);
    scrollStageIntoView();
  }

  // Fills the marked wall: scaled to cover and trimmed, like a real mural, never stretched.
  function coverWall() {
    if (!art || !placement.wallQuad) return;
    const frame = wallFrame(placement.wallQuad, wallSizeFt)!;
    const artCrop = cropToAspect({ x: 0, y: 0, w: art.width, h: art.height }, frame.width / frame.height);
    const ok = commit({
      ...placement,
      artQuad: placement.wallQuad.map((p) => [p[0], p[1]]) as Quad,
      artCrop,
      shape: getShape(placement.shape).square ? "rect" : placement.shape,
    });
    setMode("art");
    setComparePos(null);
    scrollStageIntoView();
    if (ok) notify("The design now covers the marked wall. Use Undo to go back.");
  }

  function applyArtWidth() {
    if (!art || !photo || !placement.wallQuad || !wallSizeFt) return;
    const widthFt = parseFloat(artWidthInput ?? String(artSize?.width ?? ""));
    if (!(widthFt > 0)) return notify("Enter the artwork width in feet.");
    const aspect = art.width / art.height;
    const q = artQuadFromFt(widthFt, aspect, placement.wallQuad, wallSizeFt, photo);
    if (!q) return notify(`That's larger than the wall. The most that fits is ${maxFitWidthFt(aspect, wallSizeFt).toFixed(1)} ft wide.`);
    commit({ ...placement, artQuad: q, artCrop: null });
    setArtWidthInput(null);
  }

  function fitInsideWall() {
    if (!art || !photo || !placement.wallQuad || !wallSizeFt) return;
    const aspect = art.width / art.height;
    const q = artQuadFromFt(maxFitWidthFt(aspect, wallSizeFt), aspect, placement.wallQuad, wallSizeFt, photo);
    if (q) commit({ ...placement, artQuad: q, artCrop: null });
  }

  // ---------- export ----------

  async function renderMockup() {
    return exportMockup({
      wall: wall!,
      art: art!,
      artQuad: placement.artQuad!,
      sourceRect: sourceRect!,
      shape: placement.shape,
      blend,
      opacity,
    });
  }

  async function download() {
    setBusy("download");
    try {
      const url = URL.createObjectURL(await renderMockup());
      const a = document.createElement("a");
      a.href = url;
      a.download = "apexwall-wall-preview.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      notify("Mockup saved. Attach it when you message us.");
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    setBusy("share");
    try {
      const file = new File([await renderMockup()], "apexwall-wall-preview.jpg", { type: "image/jpeg" });
      await navigator.share({
        files: [file],
        title: "My wall preview",
        text: summaryText({
          artTitle: art?.title,
          ownArtwork: art?.source === "upload",
          wallSizeFt,
          artSizeFt: artSize,
          shape: placement.shape,
          surface,
          ink,
        }),
      });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") notify("Sharing didn't work. Try Download instead.");
    } finally {
      setBusy(null);
    }
  }

  // ---------- render ----------

  const hasArt = Boolean(art && placement.artQuad);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      {/* Stage */}
      <div
        ref={stageCardRef}
        className="scroll-mt-28 rounded-[24px] border border-card-border bg-card-bg p-3 sm:p-4 lg:sticky lg:top-28"
      >
        {!wall ? (
          <div
            className={cn(
              "flex min-h-[52vh] flex-col items-center justify-center gap-4 rounded-[18px] border-2 border-dashed px-4 py-10 text-center transition-colors lg:min-h-[64vh]",
              dragOver ? "border-primary bg-highlight" : "border-card-border",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleWallFile(e.dataTransfer.files?.[0]);
            }}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-highlight text-primary">
              <ImagePlus className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="max-w-md">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Start with your wall</h2>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Take a straight-on photo of the wall in good light, or try one of our sample rooms.
              </p>
            </div>
            <FileButton accept={ACCEPT_ATTR} onFile={handleWallFile} variant="primary" disabled={busy === "wall"}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              {busy === "wall" ? "Loading…" : "Upload wall photo"}
            </FileButton>
            {errors.wall && <ErrorText>{errors.wall}</ErrorText>}
            <p className="text-xs text-muted">or try a sample room</p>
            <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3">
              {SAMPLE_ROOMS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => loadSampleRoom(room)}
                  disabled={busy === "wall"}
                  className="group overflow-hidden rounded-xl border border-card-border bg-card-bg text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                >
                  <span className="relative block aspect-[4/3] w-full">
                    <Image src={room.src} alt="" fill sizes="160px" className="object-cover" />
                  </span>
                  <span className="block px-2 py-1.5 text-[11px] font-medium text-foreground sm:text-xs">{room.title}</span>
                </button>
              ))}
            </div>
            <p className="hidden text-xs text-muted sm:block">You can also drop a photo here.</p>
          </div>
        ) : (
          <>
            <PreviewStage
              wall={wall}
              art={art}
              placement={placement}
              sourceRect={sourceRect}
              mode={mode}
              blend={blend}
              opacity={opacity}
              comparePos={comparePos}
              bannerVisible={bannerVisible}
              snapTargets={detection?.corners}
              onLive={setPlacement}
              onCommit={commit}
              onWallDragStart={() => setBannerVisible(false)}
              onScale={scaleArt}
              onRotate={rotateArt}
            />
            {hasArt && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 pt-3">
                <ToolButton
                  pressed={comparePos !== null}
                  onClick={() => {
                    setComparePos((p) => (p === null ? 50 : null));
                    setMode("art");
                  }}
                >
                  <SplitSquareHorizontal className="h-4 w-4" aria-hidden="true" />
                  Before / after
                </ToolButton>
                {placement.wallQuad && (
                  <PillButton variant="primary" className="h-9 px-4 py-0 md:px-5 md:py-0" onClick={coverWall}>
                    <Maximize className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Cover wall
                  </PillButton>
                )}
                {comparePos !== null && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={comparePos}
                    onChange={(e) => setComparePos(Number(e.target.value))}
                    aria-label="Before and after divider"
                    className="h-10 min-w-[140px] flex-1 cursor-pointer accent-primary"
                  />
                )}
                <p className="basis-full text-xs text-muted">
                  Drag the corners to fit · drag the artwork to move it
                  <span className="hidden pointer-fine:inline"> · arrow keys nudge (Shift = faster)</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Steps */}
      <div className="flex min-w-0 flex-col gap-4">
        <Step number={1} title="Your wall">
          {wall ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
              <img src={wall.url} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-card-border object-cover" />
              <div className="min-w-0">
                <p className="mb-1.5 truncate text-sm font-semibold">{wall.name}</p>
                <div className="flex flex-wrap gap-2">
                  <FileButton accept={ACCEPT_ATTR} onFile={handleWallFile} size="sm">
                    Replace
                  </FileButton>
                  <SmallButton onClick={removeWall}>Remove</SmallButton>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">JPG, PNG or WebP up to 15 MB. Your photo never leaves this device.</p>
          )}
          {wall && errors.wall && <ErrorText>{errors.wall}</ErrorText>}
        </Step>

        <Step number={2} title="Choose artwork" disabled={!wall}>
          <div role="tablist" aria-label="Artwork source" className="flex gap-1 rounded-full bg-highlight p-1">
            {(["designs", "upload"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={artTab === tab}
                onClick={() => setArtTab(tab)}
                className={cn(
                  "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  artTab === tab ? "bg-card-bg text-foreground shadow-sm" : "text-muted",
                )}
              >
                {tab === "designs" ? "Our designs" : "Your artwork"}
              </button>
            ))}
          </div>
          {artTab === "designs" ? (
            <div role="tabpanel" className="grid grid-cols-3 gap-2">
              {DESIGNS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={art?.source === "catalog" && art.id === d.id}
                  onClick={() => pickDesign(d)}
                  className="overflow-hidden rounded-xl border-2 border-transparent text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground aria-pressed:border-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
                  <img
                    src={thumbs[d.id]}
                    alt=""
                    className="aspect-square w-full rounded-[10px] bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px] object-cover"
                  />
                  <span className="block px-0.5 pb-0.5 pt-1 text-[11px] leading-tight text-muted">{d.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div role="tabpanel" className="flex flex-col gap-2">
              <FileButton accept={ACCEPT_ATTR} onFile={handleArtFile} block disabled={busy === "art"}>
                <Upload className="h-4 w-4" aria-hidden="true" />
                {busy === "art" ? "Loading…" : "Upload artwork, photo or logo"}
              </FileButton>
              <p className="text-xs text-muted">Use a PNG with a transparent background for logos.</p>
            </div>
          )}
          {art && <p className="truncate text-sm font-semibold">Selected: {art.title}</p>}
          {errors.art && <ErrorText>{errors.art}</ErrorText>}
        </Step>

        <Step number={3} title="Adjust" disabled={!hasArt}>
          <div className="flex flex-wrap gap-2">
            <IconButton label="Make smaller" onClick={() => scaleArt(1 / 1.1)}>
              <Minus className="h-4 w-4" />
            </IconButton>
            <IconButton label="Make bigger" onClick={() => scaleArt(1.1)}>
              <Plus className="h-4 w-4" />
            </IconButton>
            <IconButton label="Rotate left" onClick={() => rotateArt(-5)}>
              <RotateCcw className="h-4 w-4" />
            </IconButton>
            <IconButton label="Rotate right" onClick={() => rotateArt(5)}>
              <RotateCw className="h-4 w-4" />
            </IconButton>
            <SmallButton onClick={undo} disabled={history.length === 0}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              Undo
            </SmallButton>
            <SmallButton onClick={resetPlacement}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </SmallButton>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Shape</p>
            <div role="group" aria-label="Print shape" className="grid grid-cols-4 gap-1.5">
              {SHAPES.map((s) => {
                const pts = s.points ? s.points(20, s.square ? 20 : 14) : [[0, 0], [20, 0], [20, 14], [0, 14]];
                const oy = s.square ? 2 : 5;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={placement.shape === s.id}
                    onClick={() => setShape(s.id)}
                    className="flex flex-col items-center gap-0.5 rounded-xl border border-card-border bg-card-bg px-0.5 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary aria-pressed:border-primary aria-pressed:bg-highlight aria-pressed:text-foreground"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                      <path
                        d={toPathD(pts.map(([x, y]) => [x + 2, y + oy]))}
                        className="fill-secondary stroke-foreground"
                        strokeWidth={1.2}
                      />
                    </svg>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Look" hint={blend === "multiply" ? "Lets the wall's texture and light show through." : undefined}>
            <select value={blend} onChange={(e) => setBlend(e.target.value as Blend)} className={inputClass}>
              <option value="multiply">Printed on wall</option>
              <option value="normal">Flat, exact colours</option>
            </select>
          </Field>
          <Field label="Strength" aside={`${Math.round(opacity * 100)}%`}>
            <input
              type="range"
              min={30}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="h-10 w-full cursor-pointer accent-primary"
            />
          </Field>
        </Step>

        <Step number={4} title="Size & estimate" optional disabled={!hasArt}>
          <p className="text-sm text-muted">
            Mark your wall&apos;s corners (we detect the edges for you) and enter its real size to measure the artwork and
            estimate the price.
          </p>
          <div className="flex flex-wrap gap-2">
            <SmallButton onClick={toggleMarkWall} pressed={mode === "wall"} className="flex-1">
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              {mode === "wall" ? "Done marking" : placement.wallQuad ? "Adjust wall corners" : "Mark wall corners"}
            </SmallButton>
            {placement.wallQuad && <SmallButton onClick={redetect}>Re-detect edges</SmallButton>}
          </div>
          <PillButton variant="primary" className="w-full" disabled={!placement.wallQuad} onClick={coverWall}>
            Cover marked wall with design
          </PillButton>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Wall width (ft)">
              <NumberInput value={wallInput.width} placeholder="e.g. 12" onChange={(v) => setWallInput((w) => ({ ...w, width: v }))} />
            </Field>
            <Field label="Wall height (ft)">
              <NumberInput value={wallInput.height} placeholder="e.g. 9" onChange={(v) => setWallInput((w) => ({ ...w, height: v }))} />
            </Field>
          </div>
          <div className="flex flex-wrap items-end gap-2.5">
            <Field label="Artwork width (ft)" className="min-w-[9rem] flex-1">
              <NumberInput
                value={artWidthInput ?? (artSize ? artSize.width.toFixed(1) : "")}
                disabled={!measured}
                onChange={setArtWidthInput}
                onEnter={applyArtWidth}
              />
            </Field>
            <div className="flex gap-1.5">
              <SmallButton onClick={applyArtWidth} disabled={!measured}>
                Apply
              </SmallButton>
              <SmallButton onClick={fitInsideWall} disabled={!measured}>
                Fit inside
              </SmallButton>
            </div>
          </div>
          <Field label="Surface">
            <select value={surface} onChange={(e) => setSurface(e.target.value as Surface)} className={inputClass}>
              {SURFACES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Ink">
            <select value={ink} onChange={(e) => setInk(e.target.value as Ink)} className={inputClass}>
              {INKS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <div aria-live="polite" className="flex flex-col gap-1.5 text-sm">
            {!artSize || !estimate ? (
              <p className="text-xs text-muted">
                {placement.wallQuad
                  ? "Enter the wall's width and height to see the size and estimate."
                  : "Size and estimate appear after you mark the wall."}
              </p>
            ) : (
              <>
                <p>
                  Artwork ≈{" "}
                  <strong>
                    {artSize.width.toFixed(1)} × {artSize.height.toFixed(1)} ft
                  </strong>
                  {shape.points ? ` ${shape.label.toLowerCase()}` : ""} ({estimate.areaSqFt.toFixed(0)} sq ft printed)
                </p>
                <p className="font-display text-3xl font-semibold">{formatInr(estimate.total)}</p>
                <p className="text-xs text-muted">
                  Approximate, at {formatInr(estimate.ratePerSqFt)}/sq ft · about{" "}
                  {Math.max(1, Math.round(estimate.printHours))} h of printing. Final price after a site visit.
                </p>
                {art?.source === "upload" && ppi !== null && (
                  <p
                    className={cn("rounded-lg px-3 py-2 text-xs", {
                      "bg-success/15 text-[#36513a]": resolutionVerdict(ppi) === "good",
                      "bg-highlight text-[#6b4f33]": resolutionVerdict(ppi) === "ok",
                      "bg-[#f7e1da] text-[#7a3424]": resolutionVerdict(ppi) === "low",
                    })}
                  >
                    {VERDICT_TEXT[resolutionVerdict(ppi)]} ({Math.round(ppi)} px per inch)
                  </p>
                )}
              </>
            )}
          </div>
        </Step>

        <Step number={5} title="Save & get a quote" disabled={!hasArt}>
          <div className="flex flex-wrap gap-2">
            {canShareFiles && (
              <PillButton variant="primary" onClick={share} disabled={busy === "share"} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {busy === "share" ? "Preparing…" : "Share mockup"}
              </PillButton>
            )}
            <PillButton variant="outline" onClick={download} disabled={busy === "download"} className="flex-1">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              {busy === "download" ? "Preparing…" : "Download mockup"}
            </PillButton>
          </div>
          <PillButton asChild variant="secondary" className="w-full">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              Send details on WhatsApp
            </a>
          </PillButton>
          <p className="text-xs text-muted">
            Attach the mockup in the chat. This is a visual mockup, not an exact print proof.
          </p>
        </Step>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Your photos stay on this device. Nothing is uploaded unless you share it.
        </p>
        {wall && (
          <button
            type="button"
            onClick={startOver}
            className="mx-auto rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Start over
          </button>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[60] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-foreground px-5 py-2.5 text-center text-sm text-white shadow-lg transition-all duration-200",
          toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {toast?.message}
      </div>
    </div>
  );
}

// ---------- small building blocks ----------

const inputClass =
  "w-full min-w-0 rounded-xl border border-card-border bg-card-bg px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50";

function Step({
  number,
  title,
  optional,
  disabled,
  children,
}: {
  number: number;
  title: string;
  optional?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="flex min-w-0 flex-col gap-3 rounded-[20px] border border-card-border bg-card-bg p-4 transition-opacity disabled:opacity-50 sm:p-5"
    >
      <legend className="float-left mb-1 flex w-full items-center gap-2.5 font-display text-lg font-semibold">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-strong font-sans text-xs text-white">
          {number}
        </span>
        {title}
        {optional && <span className="ml-auto font-sans text-xs font-medium text-muted">optional</span>}
      </legend>
      <div className="clear-both flex flex-col gap-3">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  aside,
  hint,
  className,
  children,
}: {
  label: string;
  aside?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5 text-sm font-medium", className)}>
      <span className="flex justify-between gap-2">
        {label}
        {aside && <output className="font-normal text-muted">{aside}</output>}
      </span>
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

function NumberInput({
  value,
  placeholder,
  disabled,
  onChange,
  onEnter,
}: {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onEnter?: () => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0.5}
      max={200}
      step={0.5}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      className={inputClass}
    />
  );
}

const smallButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-card-border bg-card-bg px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-highlight";

function SmallButton({
  children,
  onClick,
  disabled,
  pressed,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed} className={cn(smallButtonClass, className)}>
      {children}
    </button>
  );
}

function ToolButton({ children, onClick, pressed }: { children: ReactNode; onClick: () => void; pressed: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={cn(smallButtonClass, "h-9 min-h-0")}>
      {children}
    </button>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cn(smallButtonClass, "w-10 px-0")}>
      {children}
    </button>
  );
}

function FileButton({
  accept,
  onFile,
  children,
  variant = "outline",
  size,
  block,
  disabled,
}: {
  accept: string;
  onFile: (file: File | undefined) => void;
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm";
  block?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        size === "sm"
          ? smallButtonClass
          : cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors",
              variant === "primary"
                ? "bg-foreground text-card-bg hover:bg-foreground/90"
                : "border border-foreground/20 text-foreground hover:bg-foreground/5",
            ),
        block && "w-full",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {children}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          onFile(file);
        }}
      />
    </label>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-[#b5523b]">
      {children}
    </p>
  );
}
