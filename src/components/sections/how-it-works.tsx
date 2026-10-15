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
        
        <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-12 md:mb-20 text-center">
          Process Timeline
        </h2>

        {/* Phones: line on the left, text full width. md+: centred line, steps alternate sides
            with the text sitting next to the line. */}
        <div className="relative w-full" ref={containerRef}>
          {/* Background Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-card-border -translate-x-1/2" />

          {/* Animated Fill Line */}
          <motion.div
            className="absolute left-6 md:left-1/2 top-0 w-[2px] bg-primary -translate-x-1/2 origin-top"
            style={{ height: lineHeight }}
          />

          <ol className="flex flex-col gap-12 md:gap-24 relative z-10">
            {STEPS.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <li key={step.id} className="relative flex items-center min-h-12 md:min-h-16">
                  <div
                    className={`w-full pl-20 text-left md:w-1/2 ${
                      isEven ? "md:mr-auto md:pl-0 md:pr-16 md:text-right" : "md:ml-auto md:pl-16"
                    }`}
                  >
                    <h3 className="font-display font-semibold text-xl md:text-2xl text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Number Pill (on the line) */}
                  <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border-[4px] border-card-border shadow-sm">
                    <span className="font-display font-bold text-xl md:text-2xl text-primary-strong">
                      {step.id}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
