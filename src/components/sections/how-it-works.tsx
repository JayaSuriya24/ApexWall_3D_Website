"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { MonitorSmartphone, Ruler, Printer, Sparkles } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Digital Mockup & Sizing",
    description: "Upload your 4K image or choose from our 5,000+ mural library. We generate a 3D digital preview on a photo of your actual room.",
    icon: MonitorSmartphone,
  },
  {
    num: "02",
    title: "Free Surface & Moisture Check",
    description: "Our technician visits your site in Trichy or surrounds to inspect wall leveling, dampness, and surface compatibility.",
    icon: Ruler,
  },
  {
    num: "03",
    title: "Precision Robotic Printing",
    description: "Rails assemble in 20 minutes. Dual Epson i3200 printheads deposit UV ink with micron accuracy at 20–50 sq. ft./hour.",
    icon: Printer,
  },
  {
    num: "04",
    title: "Instant UV Curing & Handover",
    description: "Built-in UV-LED cures every droplet on contact. 100% dry to touch, non-toxic, and completely odorless immediately.",
    icon: Sparkles,
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // For desktop horizontal line
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  // For mobile vertical line
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} id="process" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="How It Works."
          subtitle="A seamless 4-step process from digital concept to permanent 4K reality."
        />

        <div className="relative mt-16 md:mt-24">
          {/* Desktop Horizontal Track */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary glow-curing origin-left"
              style={{ scaleX }}
            />
          </div>

          {/* Mobile Vertical Track */}
          <div className="md:hidden absolute top-0 bottom-0 left-8 w-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-x-0 top-0 bg-primary glow-curing origin-top"
              style={{ scaleY }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {STEPS.map((step, index) => (
              <div key={step.num} className="relative flex md:flex-col gap-6 md:gap-8 group">
                {/* Node Icon */}
                <div className="relative w-16 h-16 md:w-24 md:h-24 md:mx-auto rounded-full bg-background border-2 border-white/10 flex items-center justify-center shrink-0 transition-colors duration-500 group-hover:border-primary group-hover:glow-curing z-10">
                  <step.icon className="w-6 h-6 md:w-8 md:h-8 text-muted group-hover:text-primary transition-colors" />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xs font-bold font-mono text-white border border-white/20">
                    {step.num}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col md:text-center md:items-center pt-2 md:pt-0">
                  <h3 className="text-xl font-display font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed max-w-xs">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
