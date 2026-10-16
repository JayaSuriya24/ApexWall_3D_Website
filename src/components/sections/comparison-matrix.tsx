import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

const COMPARISONS = [
  {
    feature: "Durability",
    direct: "10+ Years (Fade Resistant)",
    wallpaper: "2-4 Years (Prone to Peeling)",
  },
  {
    feature: "Surface",
    direct: "Concrete, Wood, Brick, Glass",
    wallpaper: "Smooth Plaster Only",
  },
  {
    feature: "Finish",
    direct: "Matte / Gloss (Textured Effect)",
    wallpaper: "Flat Printed Paper",
  },
  {
    feature: "Installation Time",
    direct: "2-4 Hours (Zero Mess)",
    wallpaper: "1-2 Days (Glue & Mess)",
  },
  {
    feature: "Eco-Friendly",
    direct: "Yes (UV Inks)",
    wallpaper: "No (Chemical Glues)",
  },
];

export function ComparisonMatrix() {
  return (
    <section id="why-us" className="py-12 md:py-16 bg-background px-6">
      <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
        
        <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-4">
          Direct-to-Wall vs. Wallpaper
        </h2>
        <p className="text-muted text-lg mb-16">Why printing straight onto the wall outlasts and outperforms wallpaper.</p>

        <Card className="w-full p-0 overflow-hidden bg-card-bg rounded-[24px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-3 sm:p-6 md:p-8 font-display font-semibold text-base sm:text-xl text-foreground border-b border-card-border w-1/3">
                    Feature
                  </th>
                  <th className="p-3 sm:p-6 md:p-8 font-display font-semibold text-base sm:text-xl text-foreground bg-highlight/50 border-b border-card-border w-1/3 text-center">
                    Direct-to-Wall Printing
                  </th>
                  <th className="p-3 sm:p-6 md:p-8 font-display font-semibold text-base sm:text-xl text-foreground border-b border-card-border w-1/3 text-center">
                    Custom Wallpaper
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row, i) => (
                  <tr key={i} className="group hover:bg-black/[0.02] transition-colors">
                    <td className="p-3 sm:p-6 md:p-8 text-sm sm:text-base font-medium text-foreground border-b border-card-border">
                      {row.feature}
                    </td>
                    
                    {/* Highlighted Column */}
                    <td className="p-3 sm:p-6 md:p-8 text-center bg-highlight border-b border-white/50 relative">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-success/20 flex items-center justify-center mb-1">
                          <Check className="w-5 h-5 text-success" strokeWidth={3} />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{row.direct}</span>
                      </div>
                    </td>
                    
                    <td className="p-3 sm:p-6 md:p-8 text-center border-b border-card-border">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center mb-1">
                          <X className="w-5 h-5 text-red-500" strokeWidth={3} />
                        </div>
                        <span className="text-xs sm:text-sm text-muted">{row.wallpaper}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </section>
  );
}
