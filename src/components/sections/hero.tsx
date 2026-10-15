"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ScanLine } from "lucide-react";
import { PillButton } from "@/components/ui/pill-button";

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

  useEffect(() => {
    if (isDragging) return;
    
    // Restarts whenever the slide changes, so a manual click gets the full 12 seconds
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 12000);

    return () => clearTimeout(timer);
  }, [isDragging, currentSlide]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    const next =
      e.key === "ArrowLeft" ? sliderPosition - step
      : e.key === "ArrowRight" ? sliderPosition + step
      : e.key === "Home" ? 0
      : e.key === "End" ? 100
      : null;
    if (next === null) return;
    e.preventDefault();
    setSliderPosition(Math.max(0, Math.min(100, next)));
  };

  return (
    <section className="relative pt-28 pb-12 md:pb-16 flex flex-col items-center bg-background px-6 overflow-hidden">
      
      {/* Decorative Background Elements (Hidden on mobile) */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden xl:block">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
          className="absolute top-[15%] left-[4%] w-64 h-48 rounded-2xl overflow-hidden shadow-2xl opacity-60"
        >
          <Image src="/images/architects_bg.jpg" alt="" fill sizes="300px" className="object-cover" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          className="absolute top-[40%] right-[3%] w-72 h-56 rounded-2xl overflow-hidden shadow-2xl opacity-60"
        >
          <Image src="/images/hero-after.jpg" alt="" fill sizes="300px" className="object-cover" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="absolute bottom-[10%] left-[8%] w-56 h-40 rounded-2xl overflow-hidden shadow-2xl opacity-60"
        >
          <Image src="/images/walkthrough_bg.jpg" alt="" fill sizes="300px" className="object-cover" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
          className="absolute top-[10%] right-[15%] w-48 h-36 rounded-2xl overflow-hidden shadow-2xl opacity-60"
        >
          <Image src="/images/gallery/kids-1.jpg" alt="" fill sizes="300px" className="object-cover" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.9 }}
          className="absolute bottom-[10%] right-[8%] w-52 h-36 rounded-2xl overflow-hidden shadow-2xl opacity-60"
        >
          <Image src="/images/commercial-after.jpg" alt="" fill sizes="300px" className="object-cover" />
        </motion.div>
      </div>

      {/* Slider Container (Frame 1 & 2 style) */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-6 relative z-10">
        
        <div 
          className="w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-[24px] overflow-hidden relative cursor-ew-resize shadow-md border border-card-border touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          ref={containerRef}
          role="slider"
          tabIndex={0}
          aria-label="Before and after comparison. Use the left and right arrow keys to compare."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuetext={`${Math.round(sliderPosition)}% bare wall shown`}
          onKeyDown={handleKeyDown}
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Base Image (After / Mural) */}
              <Image
                src={SLIDES[currentSlide].after}
                alt="Printed wall art"
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                preload={currentSlide === 1}
                className="object-cover select-none pointer-events-none"
              />
              
              {/* Overlay Image (Before / Bare Wall) */}
              <Image
                src={SLIDES[currentSlide].before}
                alt="Bare wall"
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                preload={currentSlide === 1}
                className="object-cover select-none pointer-events-none"
                style={{ clipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)` }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Bronze Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-primary z-10 flex items-center justify-center shadow-xl transition-transform duration-75"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          >
            <div className="bg-primary-strong text-white text-xs font-medium tracking-wide uppercase px-4 py-2 rounded-full whitespace-nowrap shadow-lg select-none pointer-events-none">
              {sliderPosition === 50 ? "Before/After" : "Drag to Transform"}
            </div>
          </div>
        </div>

        {/* Slideshow Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button 
            onClick={prevSlide}
            className="p-2.5 rounded-full bg-white border border-[#ECE5D8] shadow-sm hover:bg-gray-50 transition-colors text-foreground"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex">
            {/* 40px tap area around each small dot */}
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentSlide === index}
              >
                <span
                  className={`block w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index ? "bg-primary scale-125" : "bg-[#ECE5D8] group-hover:bg-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-2.5 rounded-full bg-white border border-[#ECE5D8] shadow-sm hover:bg-gray-50 transition-colors text-foreground"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Copy below image (Frame 1 style) */}
      <div className="mt-12 md:mt-16 text-center max-w-3xl flex flex-col items-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground font-semibold tracking-tight leading-tight mb-6">
          Wall Art, Reimagined: <br className="hidden md:block"/> Flawless Direct-to-Wall Printing
        </h1>
        <p className="text-muted text-base md:text-lg">
          Photorealistic murals printed straight onto plaster, brick, wood and glass, cured instantly with no mess and no wallpaper.
        </p>
        <PillButton asChild variant="primary" className="mt-8 gap-2 w-full sm:w-auto">
          <Link href="/preview">
            <ScanLine className="w-4 h-4" aria-hidden="true" />
            Preview on Your Wall
          </Link>
        </PillButton>
        <p className="mt-3 text-xs text-muted">Free · See any design on a photo of your wall</p>
      </div>

    </section>
  );
}
