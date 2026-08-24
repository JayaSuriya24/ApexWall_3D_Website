"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const COMPARISON_DATA = [
  {
    feature: "Durability",
    apex: { text: "10+ years indoor, fade-proof", type: "pro" },
    wallpaper: { text: "2–4 years, peels at edges", type: "con" },
    painting: { text: "3–5 years, dust & fading", type: "warn" },
  },
  {
    feature: "Execution Speed",
    apex: { text: "2–4 hours", type: "pro" },
    wallpaper: { text: "1–2 days", type: "warn" },
    painting: { text: "1–2 weeks", type: "con" },
  },
  {
    feature: "Surface Versatility",
    apex: { text: "Concrete, brick, wood, glass, metal, tile", type: "pro" },
    wallpaper: { text: "Only flat primed walls", type: "con" },
    painting: { text: "Plaster only", type: "warn" },
  },
  {
    feature: "Water & Scratch Resistance",
    apex: { text: "100% waterproof, UV-cured", type: "pro" },
    wallpaper: { text: "Damaged by moisture", type: "con" },
    painting: { text: "Prone to smudging & scratching", type: "con" },
  },
  {
    feature: "Seams & Bubbles",
    apex: { text: "Zero seams, continuous print", type: "pro" },
    wallpaper: { text: "Visible joints & air bubbles", type: "con" },
    painting: { text: "Seamless", type: "pro" },
  },
  {
    feature: "Custom Sizing",
    apex: { text: "Any dimension, edge-to-edge", type: "pro" },
    wallpaper: { text: "Roll-width constrained", type: "con" },
    painting: { text: "Any dimension", type: "pro" },
  },
];

const renderIcon = (type: string) => {
  if (type === "pro") return <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
  if (type === "con") return <XCircle className="w-5 h-5 text-destructive text-red-400 shrink-0" />;
  return <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />;
};

export function ComparisonMatrix() {
  return (
    <section id="why-us" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="The Superior Wall Finish."
          subtitle="See why homeowners and businesses in Trichy are ditching wallpaper and manual painting."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative w-full overflow-x-auto pb-6"
        >
          <div className="min-w-[800px] w-full grid grid-cols-4 gap-4 p-4 surface-glass rounded-3xl">
            {/* Headers */}
            <div className="p-4 flex items-end">
              <span className="text-muted font-medium">Feature</span>
            </div>
            <div className="p-4 rounded-t-2xl bg-primary/10 border-t border-x border-primary/30 flex items-end relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary glow-curing" />
              <span className="text-primary font-display font-bold text-lg">ApexWall 3D UV</span>
            </div>
            <div className="p-4 flex items-end">
              <span className="text-foreground font-display font-semibold">Custom Wallpaper</span>
            </div>
            <div className="p-4 flex items-end">
              <span className="text-foreground font-display font-semibold">Manual Painting</span>
            </div>

            {/* Rows */}
            {COMPARISON_DATA.map((row, i) => (
              <div key={row.feature} className="col-span-4 grid grid-cols-4 gap-4">
                {/* Feature Name */}
                <div className={cn("p-4 flex items-center border-t border-white/5", i === COMPARISON_DATA.length - 1 && "rounded-bl-2xl")}>
                  <span className="font-semibold text-foreground">{row.feature}</span>
                </div>
                {/* ApexWall Column */}
                <div className={cn("p-4 flex items-center gap-3 bg-primary/5 border-x border-primary/20", i === COMPARISON_DATA.length - 1 && "rounded-b-2xl border-b pb-5")}>
                  {renderIcon(row.apex.type)}
                  <span className="text-foreground font-medium text-sm md:text-base">{row.apex.text}</span>
                </div>
                {/* Wallpaper Column */}
                <div className="p-4 flex items-center gap-3 border-t border-white/5">
                  {renderIcon(row.wallpaper.type)}
                  <span className="text-muted text-sm md:text-base">{row.wallpaper.text}</span>
                </div>
                {/* Painting Column */}
                <div className="p-4 flex items-center gap-3 border-t border-white/5">
                  {renderIcon(row.painting.type)}
                  <span className="text-muted text-sm md:text-base">{row.painting.text}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
