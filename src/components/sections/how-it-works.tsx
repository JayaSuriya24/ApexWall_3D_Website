"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STEPS = [
  {
    id: 1,
    title: "Site Inspection & Measurement",
    description: "Our experts visit your location to measure the wall and assess surface readiness.",
  },
  {
    id: 2,
    title: "Design Mockup & Approval",
    description: "We create a 3D digital preview of your chosen artwork on your actual wall.",
  },
  {
    id: 3,
    title: "Machine Setup & Calibration",
    description: "The robotic UV printer is aligned perfectly parallel to your wall.",
  },
  {
    id: 4,
    title: "Direct Printing & Curing",
    description: "Flawless, instantly-cured printing with zero mess or downtime.",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="py-12 md:py-16 bg-background px-6">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        
        <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-20">
          Process Timeline
        </h2>

        <div className="relative w-full" ref={containerRef}>
          {/* Background Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-card-border -translate-x-1/2" />
          
          {/* Animated Fill Line */}
          <motion.div 
            className="absolute left-1/2 top-0 w-[2px] bg-primary -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-24 relative z-10">
            {STEPS.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={step.id} className="relative flex items-center justify-center w-full">
                  
                  {/* Content (Alternating) */}
                  <div className={`w-1/2 px-8 md:px-12 ${isEven ? 'text-right pr-12 md:pr-16 ml-auto order-1' : 'text-left pl-12 md:pl-16 mr-auto order-2'}`}>
                    <h3 className="font-display font-semibold text-xl md:text-2xl text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Number Pill (Center) */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border-[4px] border-card-border shadow-sm">
                    <span className="font-display font-bold text-xl md:text-2xl text-primary">
                      {step.id}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
