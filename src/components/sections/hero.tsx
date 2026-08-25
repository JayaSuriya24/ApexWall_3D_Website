"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: "commercial",
    before: "/images/commercial-before.jpg",
    after: "/images/commercial-after.jpg",
  },
  {
    id: "residential",
    before: "/images/hero-before.jpg",
    after: "/images/hero-after.jpg",
  },
  {
    id: "traditional",
    before: "/images/traditional-before.jpg",
    after: "/images/traditional-after.jpg",
  },
];

export function Hero() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

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
    <section className="relative min-h-[100dvh] pt-28 pb-12 md:pb-16 flex flex-col items-center justify-center bg-background px-6 overflow-hidden">
      
      {/* Background Watermarks */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-20 -left-10 opacity-[0.02] font-display text-8xl md:text-[12rem] font-bold text-foreground whitespace-nowrap -rotate-6">
          Direct-to-Wall
        </div>
        <img 
          src="/images/architects_bg.jpg" 
          alt="" 
          className="absolute top-32 -right-20 w-80 h-80 md:w-[32rem] md:h-[32rem] object-cover rounded-full opacity-[0.03] mix-blend-multiply blur-sm"
        />
        <img 
          src="/images/walkthrough_bg.jpg" 
          alt="" 
          className="absolute top-[50%] -left-32 w-64 h-64 md:w-96 md:h-96 object-cover rounded-[3rem] opacity-[0.03] mix-blend-multiply blur-[2px] rotate-12"
        />
        <div className="absolute bottom-10 -right-10 opacity-[0.02] font-display text-8xl md:text-[10rem] font-bold text-foreground whitespace-nowrap rotate-3">
          3D Walkthrough
        </div>
      </div>

      {/* Slider Container (Frame 1 & 2 style) */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-6 relative z-10">
        
        <div 
          className="w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-[24px] overflow-hidden relative cursor-ew-resize shadow-md border border-card-border"
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
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Base Image (After / Mural) */}
              <img
                src={SLIDES[currentSlide].after}
                alt="Printed wall art"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
              />
              
              {/* Overlay Image (Before / Bare Wall) */}
              <img
                src={SLIDES[currentSlide].before}
                alt="Bare wall"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                style={{ clipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)` }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Bronze Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-primary z-10 flex items-center justify-center shadow-xl transition-transform duration-75"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            <div className="bg-primary text-white text-xs font-medium tracking-wide uppercase px-4 py-2 rounded-full whitespace-nowrap shadow-lg select-none pointer-events-none">
              {sliderPosition === 50 ? "Before/After" : "Drag to Transform"}
            </div>
          </div>
        </div>

        {/* Slideshow Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-white border border-[#ECE5D8] shadow-sm hover:bg-gray-50 transition-colors text-foreground"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-3">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index ? "bg-primary scale-125" : "bg-[#ECE5D8] hover:bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-white border border-[#ECE5D8] shadow-sm hover:bg-gray-50 transition-colors text-foreground"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Copy below image (Frame 1 style) */}
      <div className="mt-12 md:mt-16 text-center max-w-3xl flex flex-col items-center relative z-10">
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
