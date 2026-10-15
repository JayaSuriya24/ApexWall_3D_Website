// Built-in design catalog and sample rooms for the wall preview.
// TODO: the designs below are drawn in code as placeholders. Replace them with real flat
// design files (the gallery images are room photos, so they can't be used as artwork).

export interface Design {
  id: string;
  title: string;
  category: string;
  width: number;
  height: number;
  /** PNG keeps transparency (logos); everything else is JPEG. */
  type: "image/jpeg" | "image/png";
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

export const SAMPLE_ROOMS = [
  { id: "living", title: "Living room", src: "/images/hero-before.jpg" },
  { id: "cafe", title: "Café", src: "/images/commercial-before.jpg" },
  { id: "heritage", title: "Heritage hall", src: "/images/traditional-before.jpg" },
];

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];

function botanical(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = rng(11);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1d3a2b");
  g.addColorStop(1, "#0d1f17");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const greens = ["#2f6b4a", "#3f8a5d", "#5aa572", "#8bc49a", "#24553a", "#c9a46a"];
  const s = w / 1000;
  for (let i = 0; i < 170; i++) {
    const x = r() * w, y = r() * h;
    const len = (60 + r() * 140) * s;
    const wid = len * (0.25 + r() * 0.2);
    const ang = r() * Math.PI * 2;
    const alpha = 0.75 + r() * 0.25;
    const color = pick(r, greens);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -len / 2);
    ctx.quadraticCurveTo(wid, 0, 0, len / 2);
    ctx.quadraticCurveTo(-wid, 0, 0, -len / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(0, -len / 2);
    ctx.lineTo(0, len / 2);
    ctx.stroke();
    ctx.restore();
  }
}

function mandala(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#F5ECE1";
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.47;
  const colors = ["#C19B76", "#8a5a3b", "#1C1A17", "#d9822b", "#8BA888", "#b5523b", "#C19B76"];
  const rings = [
    { r: 1, n: 32 }, { r: 0.85, n: 24 }, { r: 0.7, n: 20 }, { r: 0.56, n: 16 },
    { r: 0.42, n: 12 }, { r: 0.28, n: 10 }, { r: 0.15, n: 8 },
  ];
  rings.forEach((ring, k) => {
    const rr = R * ring.r, pl = R * 0.17, half = ((rr * Math.PI) / ring.n) * 0.9;
    ctx.fillStyle = colors[k];
    for (let i = 0; i < ring.n; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i / ring.n) * Math.PI * 2 + k * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, -rr + pl);
      ctx.quadraticCurveTo(half, -rr + pl / 2, 0, -rr);
      ctx.quadraticCurveTo(-half, -rr + pl / 2, 0, -rr + pl);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = "rgba(28,26,23,0.35)";
    ctx.lineWidth = R * 0.006;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, rr - pl), 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.fillStyle = "#C19B76";
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

function geometric(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = rng(7);
  const palette = ["#C19B76", "#1C1A17", "#E3D5C8", "#8BA888", "#F5ECE1", "#6E685E", "#d9822b"];
  const cols = 12, cell = w / cols, rows = Math.ceil(h / cell);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const x0 = x * cell, y0 = y * cell, flip = r() > 0.5;
      const c1 = pick(r, palette), c2 = pick(r, palette);
      ctx.fillStyle = c1;
      ctx.fillRect(x0, y0, cell + 1, cell + 1);
      ctx.fillStyle = c2;
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + cell + 1, y0);
        ctx.lineTo(x0, y0 + cell + 1);
      } else {
        ctx.moveTo(x0 + cell + 1, y0);
        ctx.lineTo(x0 + cell + 1, y0 + cell + 1);
        ctx.lineTo(x0, y0 + cell + 1);
      }
      ctx.fill();
    }
  }
}

function nightSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = rng(3);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0f1a3d");
  g.addColorStop(1, "#3b2a6b");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 240; i++) {
    const x = r() * w, y = r() * h * 0.85, rad = (0.6 + r() * 1.8) * (w / 1000), a = 0.4 + r() * 0.6;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#f5e6b8";
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.25, w * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,180,130,0.6)";
  for (const [x, y, rad] of [[0.76, 0.22, 0.015], [0.8, 0.29, 0.01], [0.81, 0.21, 0.008]]) {
    ctx.beginPath();
    ctx.arc(w * x, h * y, w * rad, 0, Math.PI * 2);
    ctx.fill();
  }
  const planet = (x: number, y: number, rad: number, color: string, ring: boolean) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    if (ring) {
      ctx.strokeStyle = "#f2c38b";
      ctx.lineWidth = rad * 0.12;
      ctx.beginPath();
      ctx.ellipse(x, y, rad * 1.7, rad * 0.45, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  planet(w * 0.2, h * 0.55, w * 0.06, "#e98a5b", true);
  planet(w * 0.5, h * 0.32, w * 0.03, "#8BA888", false);
  planet(w * 0.62, h * 0.62, w * 0.02, "#c48bd9", false);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.arc((w / 13) * i, h * 0.98, w * (0.05 + (i % 3) * 0.015), 0, Math.PI * 2);
    ctx.fill();
  }
}

function waves(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const colors = ["#d7ebe8", "#b5dbd6", "#8cc5bf", "#62aaa5", "#3f8c8a", "#2c6f73", "#e9d9bf", "#d8c19c", "#c19b76"];
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, w, h);
  colors.forEach((color, b) => {
    const y0 = (h * (b + 0.6)) / colors.length;
    const amp = h * 0.035, freq = 1.2 + (b % 3) * 0.4, phase = b * 1.3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += w / 120) {
      ctx.lineTo(x, y0 + Math.sin((x / w) * Math.PI * 2 * freq + phase) * amp);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });
}

function cafeLogo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Transparent background on purpose, like a customer's PNG logo.
  const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
  ctx.fillStyle = "#1C1A17";
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#C19B76";
  ctx.lineWidth = R * 0.04;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.88, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#F5ECE1";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${R * 0.3}px Georgia, serif`;
  ctx.fillText("BREW", cx, cy - R * 0.2);
  ctx.font = `700 ${R * 0.22}px Georgia, serif`;
  ctx.fillText("& CO.", cx, cy + R * 0.12);
  ctx.fillStyle = "#C19B76";
  ctx.font = `600 ${R * 0.09}px Helvetica, sans-serif`;
  ctx.fillText("EST. 2026", cx, cy + R * 0.45);
}

export const DESIGNS: Design[] = [
  { id: "botanical", title: "Botanical Leaves", category: "Residential", width: 2400, height: 1600, draw: botanical, type: "image/jpeg" },
  { id: "mandala", title: "Heritage Mandala", category: "Traditional", width: 2000, height: 2000, draw: mandala, type: "image/jpeg" },
  { id: "geometric", title: "Modern Geometric", category: "Commercial", width: 2400, height: 1400, draw: geometric, type: "image/jpeg" },
  { id: "night-sky", title: "Night Sky Adventure", category: "Kids' Rooms", width: 2400, height: 1350, draw: nightSky, type: "image/jpeg" },
  { id: "waves", title: "Calm Waves", category: "Clinics & Schools", width: 2400, height: 1200, draw: waves, type: "image/jpeg" },
  { id: "cafe-logo", title: "Café Logo", category: "Commercial", width: 1600, height: 1600, draw: cafeLogo, type: "image/png" },
];

export function renderDesign(design: Design, maxEdge = Math.max(design.width, design.height)) {
  const s = Math.min(1, maxEdge / Math.max(design.width, design.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(design.width * s);
  canvas.height = Math.round(design.height * s);
  design.draw(canvas.getContext("2d")!, canvas.width, canvas.height);
  return canvas;
}
