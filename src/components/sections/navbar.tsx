"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";
import { Menu, X, MessageCircle, ArrowRight } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Surfaces", href: "#surfaces" },
  { label: "Gallery", href: "#gallery" },
  { label: "Estimator", href: "#estimator" },
  { label: "Why Us", href: "#why-us" },
  { label: "FAQs", href: "#faqs" },
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

  const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=Hi%20ApexWall!%20I%20would%20like%20to%20book%20a%20free%20site%20inspection.`;

  return (
    <>
      {/* Top Navbar */}
      <motion.header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 md:p-4 ${
          isScrolled ? "pt-2 md:pt-4" : "pt-4 md:pt-6"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl flex items-center justify-between px-4 md:px-6 py-3 transition-all duration-500 ${
            isScrolled
              ? "surface-glass md:rounded-full"
              : "bg-transparent"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
              {/* UV Beam Icon Animation */}
              <motion.div
                className="absolute inset-0 border-2 border-primary rounded-sm opacity-50"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="w-1 h-4 bg-primary glow-curing"
                animate={{ y: ["-50%", "50%", "-50%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-glow">
              ApexWall<span className="text-primary">3D</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-success hover:text-white hover:bg-success/20 rounded-full transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <GlowButton asChild className="px-6 py-2 text-sm">
              <a href="#estimator">Book Inspection</a>
            </GlowButton>
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
      </motion.header>

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
                  className="text-2xl font-display font-medium text-foreground hover:text-primary transition-colors border-b border-white/5 pb-4"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-8">
                <GlowButton asChild className="w-full">
                  <a href="#estimator" onClick={() => setIsMobileMenuOpen(false)}>
                    Book Site Inspection
                  </a>
                </GlowButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 surface-glass border-t border-white/10 p-3 pb-safe flex items-center justify-between gap-3">
        <a
          href="#estimator"
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-foreground font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          Get Estimate
          <ArrowRight className="w-4 h-4 text-primary" />
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-success text-background hover:bg-success/90 font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
      </div>
    </>
  );
}
