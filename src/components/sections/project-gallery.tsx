"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { X, Maximize2 } from "lucide-react";

const CATEGORIES = ["All", "Living Rooms", "Pooja Walls", "Cafes", "Commercial", "Kids' Rooms"];

const PROJECTS = [
  {
    id: 1,
    title: "Tanjore Gold-Embossed Deity",
    category: "Pooja Walls",
    location: "Thillai Nagar",
    surface: "Smooth Emulsion",
    size: "6x8 ft",
    image: "https://images.unsplash.com/photo-1577083165243-731e847c13cb?auto=format&fit=crop&q=80&w=800",
    type: "image",
    span: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: 2,
    title: "Abstract Geometric Accent",
    category: "Living Rooms",
    location: "Cantonment",
    surface: "Polished Wood",
    size: "10x12 ft",
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd15?auto=format&fit=crop&q=80&w=800",
    type: "image",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    title: "Neon Cyberpunk Cafe",
    category: "Cafes",
    location: "KK Nagar",
    surface: "Raw Brick",
    size: "15x9 ft",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    type: "image",
    span: "col-span-1 row-span-2",
  },
  {
    id: 4,
    title: "Corporate Timeline Wall",
    category: "Commercial",
    location: "Srirangam",
    surface: "Glass Partition",
    size: "20x6 ft",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    type: "image",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    title: "Space Exploration Theme",
    category: "Kids' Rooms",
    location: "Ramalinga Nagar",
    surface: "Plaster",
    size: "12x10 ft",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    type: "image",
    span: "col-span-1 md:col-span-2 row-span-1",
  },
];

export function ProjectGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);

  const filteredProjects = PROJECTS.filter(
    (p) => activeCategory === "All" || p.category === activeCategory
  );

  return (
    <section id="gallery" className="py-20 md:py-32 relative bg-black/20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <SectionHeading
          title="Recent Trichy Installations."
          subtitle="Explore our portfolio of seamless 4K wall prints across residential and commercial spaces."
        />

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeCategory === category
                  ? "bg-primary text-background glow-curing"
                  : "bg-white/5 text-muted hover:text-white hover:bg-white/10 border border-white/10"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry-like Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={cn(
                  "relative group rounded-2xl overflow-hidden cursor-pointer surface-glass",
                  project.span,
                  // Fallback for masonry layout simplification
                  activeCategory !== "All" && "col-span-1 row-span-1 md:col-span-1" 
                )}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <Maximize2 className="absolute top-4 right-4 w-6 h-6 text-white/50" />
                  <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1">{project.category}</span>
                  <h3 className="text-white font-display font-semibold text-lg">{project.title}</h3>
                  <p className="text-white/70 text-sm">{project.location}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <button
              className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setSelectedProject(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              layoutId={`project-${selectedProject.id}`}
              className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden flex flex-col md:flex-row border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-2/3 aspect-video md:aspect-auto">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center bg-zinc-950">
                <span className="text-primary text-sm font-bold uppercase tracking-wider mb-2">{selectedProject.category}</span>
                <h3 className="text-white font-display font-bold text-2xl md:text-3xl mb-4">{selectedProject.title}</h3>
                
                <div className="space-y-4 text-muted">
                  <div>
                    <span className="block text-xs uppercase text-white/40 mb-1">Location</span>
                    <span className="text-white">{selectedProject.location}, Trichy</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase text-white/40 mb-1">Surface</span>
                    <span className="text-white">{selectedProject.surface}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase text-white/40 mb-1">Wall Size</span>
                    <span className="text-white">{selectedProject.size}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
