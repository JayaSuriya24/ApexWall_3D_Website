"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";
import { Menu, X } from "lucide-react";
import { PillButton } from "@/components/ui/pill-button";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Feature", href: "#feature" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
  { label: "Login", href: "#login" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-card-bg/90 backdrop-blur-md border-b border-card-border shadow-sm py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="ApexWall" 
              className="h-16 md:h-20 w-auto object-contain mix-blend-multiply" 
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center">
            <PillButton asChild variant="outline" className="px-6 py-2">
              <a href="#contact">Contact</a>
            </PillButton>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 pb-safe flex flex-col lg:hidden"
          >
            <nav className="flex flex-col gap-6 px-6 overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-foreground hover:text-primary transition-colors border-b border-card-border pb-4"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-8">
                <PillButton asChild variant="outline" className="w-full">
                  <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>
                    Contact
                  </a>
                </PillButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
