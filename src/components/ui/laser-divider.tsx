"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LaserDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full h-px overflow-hidden", className)}>
      {/* Dim base line */}
      <div className="absolute inset-0 bg-white/5" />
      
      {/* Scanning laser beam */}
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
        animate={{
          x: ["-100%", "300%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
      />
      {/* Glowing leading edge */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary glow-curing"
        animate={{
          x: ["-5vw", "105vw"],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
        style={{
          boxShadow: "0 0 20px 4px rgba(0, 240, 255, 0.8)",
        }}
      />
    </div>
  );
}
