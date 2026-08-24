"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";
import { siteConfig } from "@/config/site";

export function CostEstimator() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [materialGrade, setMaterialGrade] = useState(2);
  const [textureDepth, setTextureDepth] = useState(1);

  // Simplified pricing logic for the demo, using fixed multiplier
  const basePricePerSqFt = 150;
  // Increase price based on material grade and texture depth
  const gradeMultiplier = 1 + (materialGrade - 1) * 0.2; // e.g., Grade 1: 1x, Grade 2: 1.2x
  const textureMultiplier = 1 + (textureDepth - 1) * 0.15;
  const area = width * height;
  
  const estimatedMin = Math.round(area * basePricePerSqFt * gradeMultiplier * textureMultiplier);
  const estimatedMax = Math.round(area * (basePricePerSqFt + 50) * gradeMultiplier * textureMultiplier);

  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20ApexWall!%20I%20have%20a%20${width}ft%20x%20${height}ft%20wall%20and%20want%20to%20schedule%20a%20site%20consultation.`;

  const renderSlider = (label: string, value: number, min: number, max: number, setter: (val: number) => void, unit: string = "") => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center text-foreground font-medium">
        <span>{label}</span>
        <span>{value}{unit ? ` ${unit}` : ""}</span>
      </div>
      <div className="relative w-full h-1 bg-card-border rounded-full">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setter(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        {/* Fill Track */}
        <div 
          className="absolute top-0 left-0 h-full bg-primary rounded-full z-10" 
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        {/* Bronze Knob */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-[#E3D5C8] to-[#C19B76] border-2 border-white shadow-md z-10 pointer-events-none transition-transform"
          style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 12px)` }}
        />
      </div>
    </div>
  );

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background px-6">
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        
        <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-4">
          Pricing Estimator
        </h2>
        <p className="text-muted text-lg mb-16">Light Theme Calculator</p>

        <Card className="w-full grid md:grid-cols-2 gap-12 items-center p-8 md:p-12">
          
          {/* Left: Sliders (Representing the 4 sliders in Frame 7) */}
          <div className="flex flex-col gap-10">
            {renderSlider("Wall Width", width, 5, 50, setWidth, "ft")}
            {renderSlider("Wall Height", height, 5, 20, setHeight, "ft")}
            {renderSlider("Material Grade", materialGrade, 1, 3, setMaterialGrade, "Lvl")}
            {renderSlider("Texture Depth", textureDepth, 1, 3, setTextureDepth, "Lvl")}
          </div>

          {/* Right: Output */}
          <div className="flex flex-col items-center text-center gap-6 border-t md:border-t-0 md:border-l border-card-border pt-10 md:pt-0 md:pl-12">
            <span className="text-muted text-sm uppercase tracking-widest font-semibold">Estimated Cost:</span>
            
            <div className="font-display font-bold text-4xl md:text-5xl text-foreground">
              ₹{estimatedMin.toLocaleString()} - ₹{estimatedMax.toLocaleString()}
            </div>

            <PillButton asChild variant="outline" className="w-full mt-4">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Schedule Free Site Consultation
              </a>
            </PillButton>
          </div>

        </Card>

      </div>
    </section>
  );
}
