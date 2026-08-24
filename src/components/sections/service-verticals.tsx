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
          <Card className="flex flex-col items-center justify-center text-center gap-6 aspect-square md:aspect-auto">
            <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mb-2">
              <PenTool className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-semibold text-2xl text-foreground">
              Architects and <br/> designers
            </h3>
          </Card>

          {/* Right Column (2 Stacked Cards) */}
          <div className="flex flex-col gap-6">
            
            {/* Top Right: Textured Interior Sample */}
            <Card className="p-0 overflow-hidden h-[300px] relative group">
              <img 
                src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1000" 
                alt="High-end textured interior"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </Card>

            {/* Bottom Right: Pattern / Color Swatches */}
            <div className="grid grid-cols-2 gap-6 h-[250px]">
              <Card className="p-0 overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" 
                  alt="Geometric wall texture"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Card>
              <Card className="flex flex-col items-center justify-center bg-white shadow-sm border-card-border">
                <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
