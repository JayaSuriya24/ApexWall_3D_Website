"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const SURFACES = [
  {
    id: "plaster",
    label: "Interior Plaster",
    before: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    after: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "glass",
    label: "Commercial Glass",
    before: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    after: "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "brick",
    label: "Raw Brick",
    before: "https://images.unsplash.com/photo-1510627498534-fc6e9bc616e0?auto=format&fit=crop&q=80&w=1200",
    after: "https://images.unsplash.com/photo-1499892477393-f675706cbe6e?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "wood",
    label: "Polished Wood",
    before: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=1200",
    after: "https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=1200",
  },
];

export function BeforeAfterSlider() {
  const [activeSurface, setActiveSurface] = useState(SURFACES[0]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) handleInteraction(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleInteraction(e.touches[0].clientX);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft") setSliderPosition((prev) => Math.max(0, prev - 5));
    if (e.key === "ArrowRight") setSliderPosition((prev) => Math.min(100, prev + 5));
  };

  return (
    <section id="surfaces" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="Prints on Any Surface."
          subtitle="Drag the slider to see how standard surfaces transform with 1440 DPI UV curing."
        />

        <div className="flex flex-col items-center gap-8">
          {/* Surface Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white/5 p-2 rounded-2xl md:rounded-full backdrop-blur-md border border-white/10">
            {SURFACES.map((surface) => (
              <button
                key={surface.id}
                onClick={() => {
                  setActiveSurface(surface);
                  setSliderPosition(50);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl md:rounded-full text-sm font-semibold transition-all duration-300",
                  activeSurface.id === surface.id
                    ? "bg-primary text-background glow-curing"
                    : "text-muted hover:text-white hover:bg-white/5"
                )}
              >
                {surface.label}
              </button>
            ))}
          </div>

          {/* Slider Container */}
          <GlassCard className="w-full max-w-5xl p-2 md:p-4" elevated>
            <div
              ref={containerRef}
              className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden cursor-ew-resize group select-none"
              onMouseMove={onMouseMove}
              onTouchMove={onTouchMove}
              onClick={(e) => handleInteraction(e.clientX)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSurface.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {/* Before Image (Background) */}
                  <img
                    src={activeSurface.before}
                    alt={`${activeSurface.label} Before`}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* After Image (Foreground, Clipped) */}
                  <div
                    className="absolute inset-0 z-10 select-none pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={activeSurface.after}
                      alt={`${activeSurface.label} After UV Printing`}
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-75 ease-out"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white glow-curing">
                  <MoveHorizontal className="w-5 h-5 text-background" />
                </div>
              </div>

              {/* Accessible Range Input */}
              <input
                type="range"
                min={0}
                max={100}
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                aria-label="Image comparison slider"
                aria-valuenow={sliderPosition}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
