import { Card } from "@/components/ui/card";
import { PenTool, Palette } from "lucide-react";

export function ServiceVerticals() {
  return (
    <section id="feature" className="py-20 md:py-32 relative bg-background px-6">
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

        {/* 3-Card Bento Box Layout */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
          
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
            
            {/* Top Right: Textured Interior Sample */}
            <Card className="p-0 overflow-hidden h-[300px] relative group border-0 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1000" 
                alt="High-end textured interior"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
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
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl">
                    <Palette className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
