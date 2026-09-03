"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide splash screen after the printing animation is fully complete
    const timer = setTimeout(() => {
      setShow(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const text = "ApexWall 3D";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Subtle grid background to simulate a blank wall */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative flex items-center h-32 md:h-48 px-8">
            {/* The Text to be revealed */}
            <motion.h1
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 2.5, ease: "linear", delay: 0.5 }}
              className="font-display text-5xl md:text-8xl lg:text-[9rem] font-bold tracking-tight text-foreground whitespace-nowrap"
            >
              {text}
            </motion.h1>

            {/* The "Print Head" moving across */}
            <motion.div
              initial={{ left: "32px", opacity: 0 }} // Starts at px-8 padding
              animate={{ left: "calc(100% - 32px)", opacity: [0, 1, 1, 0] }}
              transition={{ 
                left: { duration: 2.5, ease: "linear", delay: 0.5 },
                opacity: { duration: 3.2, times: [0, 0.1, 0.85, 1], delay: 0.2 }
              }}
              className="absolute top-0 bottom-0 w-1.5 md:w-2.5 bg-zinc-800 z-10 flex flex-col justify-between items-center py-2 shadow-2xl -translate-x-1/2"
            >
              {/* Simulate CMYK ink nozzles */}
              <div className="w-full h-1/6 bg-cyan-400 animate-pulse" />
              <div className="w-full h-1/6 bg-fuchsia-500 animate-pulse" style={{ animationDelay: "100ms" }} />
              <div className="w-full h-1/6 bg-yellow-400 animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-full h-1/6 bg-zinc-900 animate-pulse" style={{ animationDelay: "300ms" }} />
              
              {/* Print Head Glow */}
              <div className="absolute inset-0 bg-primary/20 blur-md pointer-events-none" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
