"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useOverlay } from "@/lib/use-overlay";
import { GALLERY_FILTER_EVENT } from "@/lib/gallery-filter";

const CATEGORIES = ["All", "Residential", "Commercial", "Traditional", "Clinics & Schools", "Kids' Rooms"];

type Project = { id: number; title: string; category: string; image: string };

const PROJECTS: Project[] = [
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
    id: 16,
    title: "Vibrant Deity Wall Art",
    category: "Traditional",
    image: "/images/gallery/traditional-1.jpg",
  },
  {
    id: 17,
    title: "Intricate Mandala Centerpiece",
    category: "Traditional",
    image: "/images/gallery/traditional-2.jpg",
  },
  {
    id: 18,
    title: "Glowing Mandala Relief",
    category: "Traditional",
    image: "/images/gallery/traditional-3.jpg",
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
  {
    id: 13,
    title: "Farm Animal Scene",
    category: "Kids' Rooms",
    image: "/images/gallery/kids-1.jpg",
  },
  {
    id: 14,
    title: "Jungle Animals Safari",
    category: "Kids' Rooms",
    image: "/images/gallery/kids-2.jpg",
  },
  {
    id: 15,
    title: "Cute Koala Branch",
    category: "Kids' Rooms",
    image: "/images/gallery/kids-3.jpg",
  },
];

export function ProjectGallery() {
  const [activeCategory, setActiveCategory] = useState("Residential");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Other sections (e.g. the Direct-to-Wall card) can open the gallery on a category.
  useEffect(() => {
    const onFilter = (e: Event) => {
      const category = (e as CustomEvent<string>).detail;
      if (!CATEGORIES.includes(category)) return;
      setActiveCategory(category);
      setOpenIndex(null);
    };
    window.addEventListener(GALLERY_FILTER_EVENT, onFilter);
    return () => window.removeEventListener(GALLERY_FILTER_EVENT, onFilter);
  }, []);

  const filteredProjects = activeCategory === "All" 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <section id="gallery" className="py-12 md:py-16 relative bg-background px-6">
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
              aria-pressed={activeCategory === cat}
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
                <Card asChild className="p-0 overflow-hidden aspect-[4/3] relative group cursor-pointer border-card-border block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(filteredProjects.indexOf(project))}
                    aria-label={`View project: ${project.title}`}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 512px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium tracking-wide bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        View Project
                      </span>
                    </span>
                  </button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      <AnimatePresence>
        {openIndex !== null && filteredProjects[openIndex] && (
          <Lightbox
            projects={filteredProjects}
            index={openIndex}
            onChange={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Lightbox({
  projects,
  index,
  onChange,
  onClose,
}: {
  projects: Project[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  useOverlay(true, onClose);
  const project = projects[index];
  const many = projects.length > 1;
  const go = (delta: number) => onChange((index + delta + projects.length) % projects.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/90 p-4 md:p-10"
      onClick={onClose}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="relative h-[70vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image src={project.image} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain" />
      </div>
      <p className="mt-4 text-center text-white">
        <span className="font-display text-xl md:text-2xl">{project.title}</span>
        <span className="block text-sm text-white/60">
          {project.category}
          {many && ` · ${index + 1} / ${projects.length}`}
        </span>
      </p>

      <button
        type="button"
        onClick={onClose}
        autoFocus
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      {many && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous project"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-6"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next project"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-6"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}
    </motion.div>
  );
}
