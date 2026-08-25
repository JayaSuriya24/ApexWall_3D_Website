"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
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

        <div className="grid md:grid-cols-3 gap-6 w-full mb-16">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col gap-6">
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
