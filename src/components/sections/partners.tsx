import { ArrowUpRight } from "lucide-react";
import { PillButton } from "@/components/ui/pill-button";

export function Partners() {
  return (
    <section className="py-12 md:py-16 px-6 bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center bg-card-bg border border-card-border rounded-[24px] overflow-hidden p-8 md:p-12">
          
          {/* Left Text */}
          <div className="flex-1 space-y-6">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">
              Partnership: Architects & Designers
            </h2>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              We collaborate with visionary architects and interior designers to bring bespoke concepts to life. 
              Our direct-to-wall printing technology is the perfect tool for creators who refuse to compromise on detail, scale, or elegance.
            </p>
            <div className="pt-4">
              <PillButton asChild variant="primary" className="gap-2">
                <a href="#contact">
                  Become a Partner <ArrowUpRight className="w-4 h-4" />
                </a>
              </PillButton>
            </div>
          </div>

          {/* Right Partner Feature */}
          <div className="flex-1 w-full bg-background rounded-2xl p-8 border border-card-border flex flex-col items-start gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150" />
            
            <h3 className="font-display font-semibold text-2xl text-foreground">Featured Partner</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                {/* NavArc Logo placeholder or text */}
                <h4 className="font-bold text-xl tracking-wide uppercase text-foreground border-l-4 border-primary pl-4">
                  Nav-Arc
                </h4>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                One of the most innovative design practices in India, Nav-Arc creates inspiring residential, interior, and landscape projects. Their commitment to design excellence and minimal, timeless solutions perfectly aligns with the ApexWall standard of quality.
              </p>
              <a 
                href="https://www.navarc.in/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mt-2"
              >
                Visit Nav-Arc <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
