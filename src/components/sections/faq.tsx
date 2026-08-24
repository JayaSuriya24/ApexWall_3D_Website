"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "What surface prep is required before printing?",
    answer: "For emulsion-painted walls, no prep is needed if the wall is clean and level. For bare brick or highly textured walls, a quick wire-brushing to remove loose debris is sufficient. If printing on glass or tile, we apply a clear adhesion promoter 10 minutes before printing.",
  },
  {
    question: "Are the inks safe for children, pets, and Pooja spaces?",
    answer: "Absolutely. Our UV-curable inks are Greenguard Gold certified, meaning they emit zero VOCs (Volatile Organic Compounds) and are completely odorless immediately after curing. They are perfectly safe for nurseries, hospitals, and sacred spaces.",
  },
  {
    question: "How long does the print last, indoors and outdoors?",
    answer: "Indoors, our UV prints are guaranteed against fading for 10+ years. For outdoor walls exposed to direct Trichy sunlight and rain, we apply an extra clear-coat UV protectant that extends outdoor life to 3–5 years without peeling.",
  },
  {
    question: "What happens if the wall gets damaged or needs repainting later?",
    answer: "Because the ink cures directly onto the wall's surface layer, you can simply paint over the mural with 2 coats of standard primer if you ever want to change the room's look. It does not peel off like wallpaper.",
  },
  {
    question: "What is the price per square foot, and what's included?",
    answer: "Pricing starts at ₹120 per sq.ft for standard indoor emulsion walls. This includes the digital mockup, site inspection, travel within Trichy limits, machine setup, and the final 4K print. Specialized surfaces like glass or 3D embossed prints have minor add-ons.",
  },
  {
    question: "Do you print on damp or newly plastered walls?",
    answer: "No. The wall must be completely dry. We use a moisture meter during our free site inspection to ensure the wall is ready. If a wall is newly plastered, it typically needs 2–3 weeks to cure before we can print.",
  },
  {
    question: "How far do you travel from Trichy?",
    answer: "We primarily serve Tiruchirappalli and surrounding districts including Thanjavur, Karur, Pudukkottai, Dindigul, and Perambalur. For large commercial projects, we can travel across Tamil Nadu.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-4xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="Frequently Asked Questions."
          subtitle="Everything you need to know about direct-to-wall UV printing."
        />

        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <GlassCard
                key={index}
                className={cn(
                  "p-0 md:p-0 overflow-hidden transition-colors duration-300 cursor-pointer",
                  isOpen ? "border-primary/50 bg-primary/5" : "hover:border-white/20"
                )}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <button
                  className="w-full px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4 text-left focus:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className="font-display font-semibold text-lg md:text-xl text-foreground">
                    {faq.question}
                  </span>
                  <div className={cn("shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-primary")}>
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 md:px-8 md:pb-8 text-muted leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
