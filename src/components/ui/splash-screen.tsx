"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide splash screen after 6.5 seconds to allow the slower printing effect to finish
    const timer = setTimeout(() => {
      setShow(false);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

  const text = "ApexWall";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

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
          <div className="relative flex flex-col items-center">
            {/* The Text Container */}
            <div className="relative inline-block py-8">
              
              {/* The Printed Text */}
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 5, ease: "easeInOut", delay: 0.5 }}
                className="whitespace-nowrap font-display text-7xl md:text-[9rem] font-bold tracking-tight text-foreground"
              >
                ApexWall
              </motion.div>

              {/* The Printer Head & Rail */}
              <motion.div
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                transition={{ 
                  left: { duration: 5, ease: "easeInOut", delay: 0.5 },
                  opacity: { times: [0, 0.05, 0.95, 1], duration: 5.2, delay: 0.4 }
                }}
                className="absolute top-[-20%] bottom-[-20%] w-6 md:w-8 -ml-3 md:-ml-4 z-10 flex justify-center"
              >
                {/* The Vertical Rail */}
                <div className="w-2 md:w-3 h-full bg-zinc-300 dark:bg-zinc-800 border-x border-zinc-400 dark:border-zinc-700 relative">
                  
                  {/* The Moving Print Head Box */}
                  <motion.div 
                    animate={{ top: ["0%", "80%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute left-1/2 -translate-x-1/2 w-8 h-12 md:w-10 md:h-16 bg-zinc-800 dark:bg-zinc-200 rounded-sm shadow-xl border border-zinc-600 flex items-center justify-center z-20 overflow-hidden"
                  >
                    {/* Industrial details on the print head */}
                    <div className="w-full flex flex-col gap-1 px-1">
                      <div className="h-[2px] w-full bg-zinc-600 dark:bg-zinc-400" />
                      <div className="h-[2px] w-full bg-zinc-600 dark:bg-zinc-400" />
                      <div className="h-[2px] w-full bg-zinc-600 dark:bg-zinc-400" />
                    </div>

                    {/* UV Light (curing the ink behind it) */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-12 h-16 bg-blue-500/30 blur-[10px] pointer-events-none" />
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-6 h-8 bg-cyan-400/50 blur-[5px] pointer-events-none" />
                    
                    {/* Laser pointer / guide */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 w-16 h-[1px] bg-red-500/50 pointer-events-none" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1, delay: 5.7, ease: "circOut" }}
              className="h-[3px] bg-primary mt-2 rounded-full origin-left w-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
