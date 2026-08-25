"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    question: "How long does a typical wall print take?",
    answer: "A standard 10x10 ft wall takes approximately 2-4 hours from setup to completion. The UV ink cures instantly, meaning there's zero drying time.",
  },
  {
    question: "Is the ink safe for indoor environments?",
    answer: "Yes. We use eco-friendly, GREENGUARD Gold certified UV-curable inks. They produce zero VOCs, zero chemical odor, and are completely safe for children's bedrooms, hospitals, and restaurants.",
  },
  {
    question: "Can you print on textured surfaces?",
    answer: "Absolutely. Our robotic printhead uses dual-laser sensors to detect surface depth, allowing flawless printing on brick, textured plaster, wood, and even slightly curved surfaces (up to 10cm depth variation).",
  },
  {
    question: "How long will the print last?",
    answer: "Indoors, our prints are guaranteed for 10+ years without fading. Outdoors, they last 5+ years depending on direct sunlight exposure. They are completely waterproof and scratch-resistant.",
  },
  {
    question: "Do you offer custom designs?",
    answer: "Yes, our in-house design team can help you source, upscale, or custom-design any artwork to fit your wall perfectly. We provide a 3D digital mockup before printing begins.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-12 md:py-16 relative bg-background px-6">
      <div className="mx-auto max-w-3xl flex flex-col items-center">
        
        <div className="text-center mb-16">
          <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="w-full flex flex-col gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Card 
                key={index} 
                className={`p-6 cursor-pointer transition-all duration-300 ${isOpen ? 'border-primary shadow-sm' : 'border-card-border hover:border-foreground/20'}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-foreground text-lg md:text-xl">
                    {faq.question}
                  </h3>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-primary">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-muted leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
