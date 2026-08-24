"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { siteConfig } from "@/config/site";
import { Calculator, MessageCircle, Clock, Square } from "lucide-react";

type Surface = keyof typeof siteConfig.pricing.baseRates;
type InkMode = keyof typeof siteConfig.pricing.inkAddOns;
type ProjectType = "Residential" | "Commercial";

export function CostEstimator() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(8);
  const [surface, setSurface] = useState<Surface>("Smooth Emulsion Wall");
  const [inkMode, setInkMode] = useState<InkMode>("Standard CMYK");
  const [projectType, setProjectType] = useState<ProjectType>("Residential");

  const [total, setTotal] = useState(0);
  const [printTime, setPrintTime] = useState(0);
  const [area, setArea] = useState(0);

  useEffect(() => {
    const a = width * height;
    setArea(a);

    const baseRate = siteConfig.pricing.baseRates[surface];
    const multiplier = siteConfig.pricing.multipliers[surface];
    const inkAddOn = siteConfig.pricing.inkAddOns[inkMode];

    const calculatedTotal = a * ((baseRate * multiplier) + inkAddOn);
    setTotal(calculatedTotal);

    const time = a / siteConfig.pricing.speedSqFtPerHour;
    setPrintTime(time);
  }, [width, height, surface, inkMode]);

  const minTotal = Math.round(total * 0.92);
  const maxTotal = Math.round(total * 1.08);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const whatsappMessage = `Hi ApexWall! I calculated an estimate for a ${width}x${height}ft wall (${surface} surface, ${inkMode}). Estimated Cost: ${formatCurrency(minTotal)} - ${formatCurrency(maxTotal)}. Please schedule a free site visit.`;
  const whatsappUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section id="estimator" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="Live Project Estimator."
          subtitle="Get a transparent, instant cost estimate for your Trichy project before booking a site inspection."
        />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Controls */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <GlassCard className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg">Wall Dimensions (Feet)</h3>
                <div className="text-primary font-mono bg-primary/10 px-3 py-1 rounded-md text-sm">
                  {width}w × {height}h
                </div>
              </div>

              {/* Width Slider */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm text-muted">
                  <span>Width: {width} ft</span>
                  <span>40 ft max</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="40"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Height Slider */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm text-muted">
                  <span>Height: {height} ft</span>
                  <span>15 ft max</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="15"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-6">
              <h3 className="font-display font-semibold text-lg">Surface Type</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {(Object.keys(siteConfig.pricing.baseRates) as Surface[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSurface(s)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      surface === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 hover:border-white/20 text-muted hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-sm">{s}</div>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-6">
              <h3 className="font-display font-semibold text-lg">Ink Layer Mode</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {(Object.keys(siteConfig.pricing.inkAddOns) as InkMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInkMode(mode)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      inkMode === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 hover:border-white/20 text-muted hover:text-white"
                    }`}
                  >
                    <div className="font-medium text-sm leading-snug">{mode}</div>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Results Sticky Card */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <GlassCard elevated className="flex flex-col gap-6 border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-secondary" />
                
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Calculator className="w-6 h-6" />
                  <h3 className="font-display font-bold text-xl">Estimated Quote</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-muted">
                      <Square className="w-4 h-4" />
                      Total Area
                    </div>
                    <span className="font-mono font-medium text-foreground">{area} sq.ft</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="w-4 h-4" />
                      Est. Print Time
                    </div>
                    <span className="font-mono font-medium text-foreground">
                      {printTime < 1 ? "< 1 hr" : `~${printTime.toFixed(1)} hrs`}
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <span className="text-sm text-muted">Estimated Range</span>
                    <motion.div
                      key={total}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display font-bold text-3xl md:text-4xl text-glow text-white tracking-tight"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatCurrency(minTotal)} — {formatCurrency(maxTotal)}
                    </motion.div>
                    <p className="text-xs text-muted mt-2">
                      *Final quote provided after free site inspection in Trichy region to assess wall leveling and primer needs.
                    </p>
                  </div>
                </div>

                <GlowButton asChild className="w-full mt-4 gap-2 text-lg">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5" />
                    Lock Estimate & Chat
                  </a>
                </GlowButton>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
