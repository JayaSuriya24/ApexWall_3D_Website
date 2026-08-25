"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Map, Footprints, Layers, Expand, CheckCircle2, ShieldCheck } from "lucide-react";
import { PillButton } from "@/components/ui/pill-button";

const STAGES = [
  {
    num: "01",
    title: "Upload Your Plan",
    desc: "Provide your architectural drawing, floor plan, or proposed layout.",
    icon: <Map className="w-6 h-6" />
  },
  {
    num: "02",
    title: "Experience It at Full Scale",
    desc: "Transform the digital plan into a real-world, 1:1 spatial experience that lets clients physically walk through the proposed layout.",
    icon: <Expand className="w-6 h-6" />
  },
  {
    num: "03",
    title: "Refine Before You Build",
    desc: "Identify spacing issues, circulation problems, furniture conflicts, and design changes before committing to construction.",
    icon: <CheckCircle2 className="w-6 h-6" />
  }
];

const BENEFITS = [
  {
    title: "Understand Scale",
    desc: "See exactly how large rooms and spaces will feel.",
    icon: <Expand className="w-5 h-5 text-primary" />
  },
  {
    title: "Test Spatial Flow",
    desc: "Walk through entrances, rooms, hallways, and transitions.",
    icon: <Footprints className="w-5 h-5 text-primary" />
  },
  {
    title: "Make Better Decisions",
    desc: "Evaluate layouts before construction or installation.",
    icon: <Layers className="w-5 h-5 text-primary" />
  },
  {
    title: "Reduce Costly Changes",
    desc: "Catch design issues early rather than after construction begins.",
    icon: <ShieldCheck className="w-5 h-5 text-primary" />
  }
];

export function FloorplanWalkthrough() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="3d-walkthrough" className="py-24 md:py-32 bg-card-bg px-6 border-y border-card-border overflow-hidden">
      <div className="mx-auto max-w-7xl flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl">
          <h2 className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
            Walk Through Your Space <br className="hidden md:block" /> Before It Exists.
          </h2>
          <p className="text-muted text-lg md:text-xl leading-relaxed">
            Experience your floor plan at real-world scale before a single wall is built. Step inside your proposed layout, understand proportions, test spatial flow, and make confident design decisions before construction begins.
          </p>
        </div>

        {/* Interactive Visualizer Area */}
        <div className="w-full bg-background rounded-[32px] border border-card-border p-8 md:p-12 mb-20 shadow-sm flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Text Steps */}
          <div className="flex-1 space-y-8">
            {STAGES.map((stage, index) => (
              <div 
                key={index} 
                className={`flex gap-6 transition-all duration-500 cursor-pointer ${activeStep === index ? "opacity-100 translate-x-2" : "opacity-40 hover:opacity-70"}`}
                onClick={() => setActiveStep(index)}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${activeStep === index ? "border-primary text-primary" : "border-card-border text-muted"}`}>
                    <span className="font-display font-bold text-lg">{stage.num}</span>
                  </div>
                  {index < STAGES.length - 1 && <div className="w-px h-16 bg-card-border" />}
                </div>
                <div className="pt-2">
                  <h3 className="font-display font-semibold text-2xl text-foreground mb-2 flex items-center gap-3">
                    {stage.title} 
                    {activeStep === index && <motion.div layoutId="icon" className="text-primary">{stage.icon}</motion.div>}
                  </h3>
                  <p className="text-muted leading-relaxed max-w-md">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visualizer Frame */}
          <div className="flex-1 w-full aspect-square md:aspect-[4/3] rounded-[24px] bg-card-bg border border-card-border relative overflow-hidden flex items-center justify-center shadow-inner">
            <AnimatePresence mode="wait">
              {/* Concept visuals based on active step */}
              {activeStep === 0 && (
                <motion.div 
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-[#eef1f5] flex items-center justify-center p-12"
                >
                  {/* Blueprint representation */}
                  <div className="w-full h-full border-2 border-[#a3b1c6] rounded-lg grid grid-cols-3 grid-rows-3 gap-2 p-4 shadow-sm bg-white/50">
                    <div className="col-span-2 row-span-2 border-2 border-[#a3b1c6] flex items-center justify-center text-[#7f8da3] font-display text-xl tracking-wide bg-blue-50/20">Living Area</div>
                    <div className="col-span-1 row-span-1 border-2 border-[#a3b1c6] flex items-center justify-center text-[#7f8da3] font-display text-sm bg-blue-50/20">Bath</div>
                    <div className="col-span-1 row-span-2 border-2 border-[#a3b1c6] flex items-center justify-center text-[#7f8da3] font-display bg-blue-50/20">Master Suite</div>
                    <div className="col-span-2 row-span-1 border-2 border-[#a3b1c6] flex items-center justify-center text-[#7f8da3] font-display tracking-widest bg-blue-50/20">Terrace</div>
                  </div>
                </motion.div>
              )}
              
              {activeStep === 1 && (
                <motion.div 
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center p-12 bg-white"
                >
                  {/* 3D Layout representation */}
                  <motion.div 
                    initial={{ opacity: 0, rotateX: 60, rotateZ: -45, scale: 0.8 }} 
                    animate={{ opacity: 1, rotateX: 55, rotateZ: -35, scale: 1 }} 
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full aspect-square bg-[#f5f3ef] shadow-2xl rounded-lg border border-gray-200 relative transform-gpu"
                  >
                    <div className="absolute bottom-10 left-10 w-32 h-24 bg-gray-300 shadow-lg border-t border-l border-white/50" />
                    <div className="absolute top-10 right-10 w-20 h-32 bg-gray-200 shadow-lg border-t border-l border-white/50" />
                    <div className="absolute bottom-20 right-20 w-12 h-12 bg-gray-400 shadow-lg border-t border-l border-white/50 rounded-full" />
                  </motion.div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div 
                  key="step-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  {/* Full Scale representation */}
                  <motion.img 
                    initial={{ opacity: 0, scale: 1.1 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 2, ease: "easeOut" }}
                    src="/images/walkthrough_bg.jpg"
                    alt="Full scale walkthrough"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl flex items-center gap-4 shadow-xl"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Spatial Flow Validated</p>
                      <p className="text-muted text-xs">Clearance issues resolved before construction.</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <h3 className="font-display text-3xl font-semibold text-foreground">The Value of Validation</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, i) => (
              <Card key={i} className="p-6 bg-background border-card-border shadow-sm flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-card-bg border border-card-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold text-foreground text-lg">{benefit.title}</h4>
                <p className="text-muted text-sm leading-relaxed">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <PillButton asChild variant="default" className="px-10 py-4 text-lg shadow-xl shadow-primary/20">
            <a href="#contact">Book Your Walkthrough</a>
          </PillButton>
        </div>

      </div>
    </section>
  );
}
