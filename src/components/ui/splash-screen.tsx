"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3.2 seconds to allow the typewriter effect to finish
    const timer = setTimeout(() => {
      setShow(false);
    }, 3200);
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center">
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="font-display text-7xl md:text-[9rem] font-bold tracking-tight text-foreground flex overflow-hidden py-4"
            >
              {text.split("").map((letter, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {letter}
                </motion.span>
              ))}
            </motion.h1>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1, delay: 1.5, ease: "circOut" }}
              className="h-[3px] bg-primary mt-2 rounded-full origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
