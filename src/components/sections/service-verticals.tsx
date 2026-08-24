"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { 
  Flower2, 
  Home, 
  Coffee, 
  Building2, 
  PenTool, 
  ArrowRight,
  X
} from "lucide-react";

const SERVICES = [
  {
    title: "Spiritual & Traditional Pooja Decor",
    description: "Lord Ranganathar, Rockfort Vinayagar, and Tanjore-style gold-embossed deities printed directly behind home altars with sacred geometry.",
    icon: Flower2,
  },
  {
    title: "Modern Homes & Apartments",
    description: "Living-room accent walls, kids' educational themes, and family portraits customized for Cantonment, Thillai Nagar, and KK Nagar flats.",
    icon: Home,
  },
  {
    title: "Cafes, Eateries & Lounges",
    description: "Instagrammable photo walls, neon-aesthetic murals, and signature coffee-shop art that keeps customers coming back.",
    icon: Coffee,
  },
  {
    title: "Schools, Clinics & Corporates",
    description: "Calming clinic art, pediatric murals, school cartoon themes, boardroom branding, and mission statement graphics.",
    icon: Building2,
  },
];

export function ServiceVerticals() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <section id="services" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="Designed for Every Space."
          subtitle="From sacred spaces to commercial storefronts, we bring walls to life across Trichy."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col gap-4 group cursor-default" elevated>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:glow-curing transition-all duration-300">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mt-2">
                  {service.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {service.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Partner Program Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 border border-white/10 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                <PenTool className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
                  Architect & Interior Designer Partner Program
                </h3>
                <p className="text-muted max-w-2xl">
                  Get sample kits, trade pricing, commission structures, and priority slot booking for your Trichy projects.
                </p>
              </div>
            </div>
            <GlowButton variant="secondary" onClick={() => setIsPartnerModalOpen(true)} className="shrink-0 gap-2 w-full md:w-auto">
              Join Program <ArrowRight className="w-4 h-4" />
            </GlowButton>
          </GlassCard>
        </motion.div>
      </div>

      {/* Partner Modal */}
      <AnimatePresence>
        {isPartnerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md surface-glass rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">Partner With Us</h3>
              <p className="text-muted text-sm mb-6">Enter your details and our trade team will contact you within 24 hours.</p>
              
              <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsPartnerModalOpen(false); }}>
                <input required type="text" placeholder="Full Name" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                <input required type="text" placeholder="Firm Name (if applicable)" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                <input required type="tel" placeholder="WhatsApp Number" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                <GlowButton type="submit" className="w-full mt-2">Request Trade Kit</GlowButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
