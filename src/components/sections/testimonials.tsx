"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star, ShieldCheck, Leaf, Factory } from "lucide-react";

export type Testimonial = {
  name: string;
  location: string;
  project: string;
  text: string;
  rating: number;
};

export const INITIAL_TESTIMONIALS: Testimonial[] = [];

const TRUST_MARKS = [
  { text: "Made in Tamil Nadu", icon: Factory },
  { text: "Greenguard-Certified Inks", icon: Leaf },
  { text: "Zero Chemical Odor", icon: ShieldCheck },
];

export function Testimonials({ data = INITIAL_TESTIMONIALS }: { data?: Testimonial[] }) {
  return (
    <section className="py-12 md:py-16 relative bg-background px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full mb-12 md:mb-16">
          <div className="flex flex-col max-w-2xl">
            <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-4">
              Trusted Across Trichy.
            </h2>
            <p className="text-muted text-lg">
              Don't just take our word for it. See what our clients have to say about the ApexWall finish.
            </p>
          </div>
          
          {/* Google Review Badge */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <div className="text-sm text-foreground font-semibold">
              <span className="text-xl font-bold">5.0</span> / 5.0 Average Rating
            </div>
            <span className="text-xs text-muted">Based on 45+ Google Reviews</span>
          </div>
        </div>

        <div className="relative w-full mb-16 group">
          {/* Scroll Buttons */}
          <button 
            onClick={() => {
              const el = document.getElementById('testimonials-container');
              if (el) el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' });
            }}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white border border-card-border rounded-full shadow-lg text-foreground hidden md:block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={() => {
              const el = document.getElementById('testimonials-container');
              if (el) el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
            }}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white border border-card-border rounded-full shadow-lg text-foreground hidden md:block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <div 
            id="testimonials-container"
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 w-full pb-8 pt-4 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
          >
            {data.map((testimonial, i) => (
              <motion.div
                key={testimonial.name + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.1 }}
                className="flex flex-col shrink-0 snap-start w-[85vw] md:w-[calc(33.333%-16px)]"
              >
                <Card className="flex-1 flex flex-col gap-6 h-full">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted italic flex-1">"{testimonial.text}"</p>
                  <div>
                    <h4 className="text-foreground font-bold font-display">{testimonial.name}</h4>
                    <p className="text-xs text-muted">{testimonial.location} · {testimonial.project}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap w-full items-center justify-center gap-8 md:gap-16 py-8 border-y border-card-border bg-card-bg rounded-2xl">
          {TRUST_MARKS.map((mark) => (
            <div key={mark.text} className="flex items-center gap-3">
              <mark.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium tracking-wide text-muted uppercase">{mark.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
