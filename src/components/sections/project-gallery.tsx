"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

const CATEGORIES = ["All", "Residential", "Commercial", "Traditional", "Clinics & Schools"];

const PROJECTS = [
  {
    id: 1,
    title: "Dark Floral Masterpiece",
    category: "Residential",
    image: "/images/gallery/residential-1.jpg",
  },
  {
    id: 2,
    title: "Botanical Fern Wall",
    category: "Residential",
    image: "/images/gallery/residential-2.jpg",
  },
  {
    id: 3,
    title: "Modern Geometric",
    category: "Residential",
    image: "/images/gallery/residential-3.jpg",
  },
  {
    id: 4,
    title: "Rockfort Temple Mural",
    category: "Traditional",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Cafe Wicker Art",
    category: "Commercial",
    image: "/images/gallery/commercial-1.jpg",
  },
  {
    id: 6,
    title: "Sculpted Wood Wall",
    category: "Commercial",
    image: "/images/gallery/commercial-2.jpg",
  },
  {
    id: 7,
    title: "Line Art Barista",
    category: "Commercial",
    image: "/images/gallery/commercial-3.png",
  },
  {
    id: 8,
    title: "Vibrant Mexican Kitchen",
    category: "Commercial",
    image: "/images/gallery/commercial-4.jpg",
  },
  {
    id: 9,
    title: "Elegant Fine Dining",
    category: "Commercial",
    image: "/images/gallery/commercial-5.jpg",
  },
  {
    id: 10,
    title: "Pediatric Waiting Area",
    category: "Clinics & Schools",
    image: "/images/gallery/clinic-1.jpg",
  },
  {
    id: 11,
    title: "School Playroom",
    category: "Clinics & Schools",
    image: "/images/gallery/clinic-2.jpg",
  },
  {
    id: 12,
    title: "Dental Office Rainforest",
    category: "Clinics & Schools",
    image: "/images/gallery/clinic-3.jpg",
  },
];

export function ProjectGallery() {
  const [activeCategory, setActiveCategory] = useState("Residential");

  const filteredProjects = activeCategory === "All" 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.category === activeCategory);

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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
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
