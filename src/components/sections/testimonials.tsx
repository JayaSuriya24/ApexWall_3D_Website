"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Star, ShieldCheck, Leaf, Factory } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Karthik R.",
    location: "Thillai Nagar, Trichy",
    project: "Living Room Accent Wall",
    text: "We wanted something unique for our new flat. ApexWall came in, set up their robotic printer, and within 3 hours our plain wall was transformed into an incredible 3D forest mural. No mess, no smell.",
    rating: 5,
  },
  {
    name: "Priya S.",
    location: "KK Nagar Cafe Owner",
    project: "Commercial Branding",
    text: "I was considering custom wallpaper, but heard it peels near the AC vents. UV wall printing was the best decision. The colors pop so vibrantly, and our customers constantly use it as a selfie background.",
    rating: 5,
  },
  {
    name: "Venkatachalam M.",
    location: "Srirangam",
    project: "Pooja Room Deity",
    text: "The detail on the Lord Ranganathar print is divine. It looks exactly like a traditional Tanjore painting but printed directly onto our plaster. Highly recommend their professional team.",
    rating: 5,
  },
];

const TRUST_MARKS = [
  { text: "Made in Tamil Nadu", icon: Factory },
  { text: "Greenguard-Certified Inks", icon: Leaf },
  { text: "Zero Chemical Odor", icon: ShieldCheck },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <SectionHeading
            title="Trusted Across Trichy."
            subtitle="Don't just take our word for it. See what our clients have to say about the ApexWall finish."
            centered={false}
            className="mb-0 md:mb-0"
          />
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

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col gap-6">
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted italic flex-1">"{testimonial.text}"</p>
                <div>
                  <h4 className="text-foreground font-bold font-display">{testimonial.name}</h4>
                  <p className="text-xs text-white/50">{testimonial.location} · {testimonial.project}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-8 border-y border-white/10 bg-black/20">
          {TRUST_MARKS.map((mark) => (
            <div key={mark.text} className="flex items-center gap-3">
              <mark.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium tracking-wide text-white/80 uppercase">{mark.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
