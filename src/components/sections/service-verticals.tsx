"use client";

import { Card } from "@/components/ui/card";
import { PenTool, Palette } from "lucide-react";

export function ServiceVerticals() {
  return (
    <section id="feature" className="py-12 md:py-16 relative bg-background px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center">
        <div className="text-center mb-16 max-w-2xl">
          <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-4">
            Customization for Visionaries: <br/> A Partnership in Precision
          </h2>
          <p className="text-muted text-base md:text-lg">
            Instead of tech cards to create centerpieces sedolation <br className="hidden md:block"/>
            professional, classic, and elegant designs.
          </p>
        </div>

        {/* 4-Card Bento Box Layout */}
        <div className="flex flex-col gap-6 w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6 w-full">
            
            {/* Left Large Card: Architects & Designers */}
            <Card className="relative overflow-hidden group aspect-square md:aspect-auto md:min-h-[500px]">
              <img 
                src="/images/architects_bg.jpg" 
                alt="Architectural workspace"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Elegant dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col items-center justify-end text-center gap-4 z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2 shadow-xl">
                  <PenTool className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-semibold text-3xl text-white">
                  Architects and <br/> designers
                </h3>
              </div>
            </Card>

            {/* Right Column (2 Stacked Cards) */}
            <div className="flex flex-col gap-6">
              
              {/* Top Right: Direct-to-Wall Printing */}
              <Card className="p-0 overflow-hidden h-[300px] relative group border-0 shadow-md">
                <img 
                  src="/images/direct-to-wall.jpg" 
                  alt="Direct-to-Wall Printing in action"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col items-start justify-end z-10">
                  <h3 className="font-display font-semibold text-2xl text-white drop-shadow-md">
                    Direct-to-Wall <br/> Printing
                  </h3>
                </div>
              </Card>

              {/* Bottom Right: Pattern / Color Swatches */}
              <div className="grid grid-cols-2 gap-6 h-[250px]">
                <Card className="p-0 overflow-hidden relative group border-0 shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" 
                    alt="Geometric wall texture"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Card>
                <Card className="relative overflow-hidden group border-0 shadow-md">
                  <img 
                    src="/images/palette_bg.jpg" 
                    alt="Design material swatches"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl">
                      <Palette className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display font-semibold text-lg md:text-xl text-white leading-tight drop-shadow-md">
                      Architectural <br/> Modeling
                    </h3>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Card: Real-Size 3D Walkthrough */}
          <Card className="relative overflow-hidden group min-h-[400px] md:min-h-[500px] border-0 shadow-md flex items-end">
            <img 
              src="/images/walkthrough_bg.jpg" 
              alt="Real-Size 3D Floorplan Walkthrough"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Elegant dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="relative z-10 p-8 md:p-12 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex flex-col gap-3 max-w-2xl">
                <span className="text-primary font-medium tracking-wider uppercase text-sm">New Premium Service</span>
                <h3 className="font-display font-semibold text-3xl md:text-5xl text-white">
                  Real-Size 3D Walkthrough
                </h3>
                <p className="text-white/80 text-lg md:text-xl">
                  Experience your floor plan at 1:1 scale before construction begins.
                </p>
              </div>
              <a 
                href="#3d-walkthrough" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('3d-walkthrough')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center bg-white text-foreground px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Experience Your Space
              </a>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
