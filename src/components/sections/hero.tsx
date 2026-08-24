"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2 } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { siteConfig } from "@/config/site";

const TRUST_BADGES = [
  "100% Scratch & Water Resistant",
  "10+ Years Indoor Durability",
  "Eco-Friendly UV Inks",
  "Zero Chemical Odor",
];

export function Hero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col justify-center">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy */}
        <div className="flex flex-col gap-6 md:gap-8 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-glow leading-[1.1]"
          >
            Transform Any Blank Wall into <span className="text-primary">4K Masterpieces</span> in Hours.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted leading-relaxed"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <GlowButton asChild className="w-full sm:w-auto">
              <a href="#estimator">Calculate Project Cost</a>
            </GlowButton>
            <GlowButton
              variant="outline"
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Machine in Action
            </GlowButton>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-white/10"
          >
            {TRUST_BADGES.map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {badge}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Dynamic Printhead Scanner Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden surface-elevated group"
        >
          {/* Bare Wall Image (Background) */}
          <img
            src="https://images.unsplash.com/photo-1598928506311-c55d43e122b5?auto=format&fit=crop&q=80&w=1000"
            alt="Bare concrete wall"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Mural Image (Foreground, clipped) */}
          <motion.div
            className="absolute inset-0 z-10"
            animate={{
              clipPath: [
                "inset(0 100% 0 0)", // Start fully hidden (right side clipped)
                "inset(0 0% 0 0)",   // Reveal to full width
                "inset(0 100% 0 0)", // Hide again
              ],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1518599904199-0ca897819ddb?auto=format&fit=crop&q=80&w=1000"
              alt="4K UV Mural"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>

          {/* Vertical Printhead Laser */}
          <motion.div
            className="absolute top-0 bottom-0 z-20 w-1 bg-primary glow-curing"
            animate={{
              left: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Spraying Particles Effect on the leading edge */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[300px] bg-primary/20 blur-3xl rounded-full" />
            <div className="absolute top-0 bottom-0 left-[-2px] w-2 bg-gradient-to-b from-transparent via-white to-transparent opacity-50 mix-blend-overlay" />
          </motion.div>

          {/* Machine Track Overlay (Decorative) */}
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/80 to-transparent z-30" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30" />
        </motion.div>
      </div>

      {/* Video Modal (Simplified Placeholder) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black transition-colors"
            >
              ×
            </button>
            <div className="w-full h-full flex items-center justify-center text-muted">
              {/* Replace with actual video iframe later */}
              <p>Demo Video Placeholder (YouTube / MP4)</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
