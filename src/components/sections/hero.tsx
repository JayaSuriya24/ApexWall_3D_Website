"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export function Hero() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-background px-6">
      
      {/* Slider Container (Frame 1 & 2 style) */}
      <div 
        className="w-full max-w-6xl aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-[24px] overflow-hidden relative cursor-ew-resize shadow-md border border-card-border"
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Base Image (After / Mural) */}
        <img
          src="/images/hero-after.jpg"
          alt="Printed floral wall art"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
        
        {/* Overlay Image (Before / Bare Wall) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src="/images/hero-before.jpg"
            alt="Bare living room wall"
            className="absolute inset-0 w-full h-full object-cover max-w-none select-none pointer-events-none"
            style={{ width: "100vw", maxWidth: "100%" }}
          />
        </div>

        {/* Bronze Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-primary z-10 flex items-center justify-center shadow-xl"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="bg-primary text-white text-xs font-medium tracking-wide uppercase px-4 py-2 rounded-full whitespace-nowrap shadow-lg">
            {sliderPosition === 50 ? "Before/After" : "Drag to Transform"}
          </div>
        </div>
      </div>

      {/* Copy below image (Frame 1 style) */}
      <div className="mt-12 md:mt-16 text-center max-w-3xl flex flex-col items-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground font-semibold tracking-tight leading-tight mb-6">
          Wall Art, Reimagined: <br className="hidden md:block"/> Flawless Direct-to-Wall Printing
        </h1>
        <p className="text-muted text-base md:text-lg">
          Entente technoloqics oentement system is optimized for professional, classic elegance.
        </p>
      </div>

    </section>
  );
}
