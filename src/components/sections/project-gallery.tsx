"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

const CATEGORIES = ["Residential", "Commercial", "Traditional"];

const PROJECTS = [
  {
    id: 1,
    title: "3D Stucco Flower",
    category: "Residential",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Rockfort Temple Mural",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Gold World Map",
    category: "Commercial",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Sculptural Art",
    category: "Residential",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
  },
];

export function ProjectGallery() {
  const [activeCategory, setActiveCategory] = useState("Residential");

  return (
    <section id="gallery" className="py-20 md:py-32 relative bg-background px-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center">
        
        {/* Header */}
        <h2 className="font-display font-semibold text-4xl md:text-5xl text-foreground mb-8">
          Gallery
        </h2>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-foreground text-card-bg shadow-sm" 
                  : "bg-transparent text-muted hover:text-foreground border border-card-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          <AnimatePresence mode="popLayout">
            {PROJECTS.map((project) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-0 overflow-hidden aspect-[4/3] relative group cursor-pointer border-card-border">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium tracking-wide bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                      View Project
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
