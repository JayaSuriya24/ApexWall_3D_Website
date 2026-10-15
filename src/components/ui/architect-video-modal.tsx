"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { useOverlay } from "@/lib/use-overlay";

interface ArchitectVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SLIDES = [
  {
    image: "/images/architects_bg.jpg",
    title: "Empowering Visionary Architects",
    subtitle: "A partnership in precision and flawless execution.",
  },
  {
    image: "/images/direct-to-wall.jpg",
    title: "Direct-to-Any-Surface Printing",
    subtitle: "No canvases, no limits. Print on brick, wood, glass, and concrete.",
  },
  {
    image: "/images/commercial-after.jpg",
    title: "Limitless Scale & Precision",
    subtitle: "Stunning edge-to-edge detailing for commercial and residential spaces.",
  },
  {
    image: "/images/interior-design.png",
    title: "Bring Bespoke Concepts to Life",
    subtitle: "Turn your most ambitious architectural models into breathtaking reality.",
  },
];

const SLIDE_DURATION = 4000; // 4 seconds per slide

export function ArchitectVideoModal({ isOpen, onClose }: ArchitectVideoModalProps) {
  // Mounting the player only while open lets the exit animation play and
  // gives every opening a fresh start from the first slide.
  return <AnimatePresence>{isOpen && <VideoPlayer onClose={onClose} />}</AnimatePresence>;
}

function VideoPlayer({ onClose }: { onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  useOverlay(true, onClose);

  useEffect(() => {
    if (isFinished) return;
    const timer = setTimeout(() => {
      if (currentSlide < SLIDES.length - 1) setCurrentSlide((prev) => prev + 1);
      else setIsFinished(true);
    }, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [currentSlide, isFinished]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Video: ApexWall for architects and designers"
      className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden"
    >
      {/* Progress Bar (Video-style) */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-white/20 z-20 flex" aria-hidden="true">
        {SLIDES.map((_, index) => (
          <div key={index} className="flex-1 h-full mx-[1px] relative overflow-hidden rounded-full">
            {index < currentSlide || (index === currentSlide && isFinished) ? (
              <div className="absolute inset-0 bg-primary" />
            ) : index === currentSlide ? (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-primary"
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Video Frame */}
      <div className="flex-1 relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image src={SLIDES[currentSlide].image} alt="" fill sizes="100vw" className="object-cover opacity-60" />

            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-display font-bold text-4xl md:text-6xl text-white mb-4 drop-shadow-xl"
                aria-live="polite"
              >
                {SLIDES[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-white/90 text-lg md:text-2xl max-w-3xl drop-shadow-md"
              >
                {SLIDES[currentSlide].subtitle}
              </motion.p>

              {/* Finished State Replay Button */}
              {isFinished && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="mt-12"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSlide(0);
                      setIsFinished(false);
                    }}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full transition-colors border border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <RotateCcw className="w-5 h-5" aria-hidden="true" />
                    <span>Replay Video</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls / Close Button */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center z-20 px-6">
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium shadow-2xl hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <X className="w-5 h-5" aria-hidden="true" />
          <span>Close Video</span>
        </button>
      </div>
    </motion.div>
  );
}
