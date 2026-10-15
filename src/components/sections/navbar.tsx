"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ScanLine } from "lucide-react";
import { PillButton } from "@/components/ui/pill-button";

// Section links work from any page: on the home page they smooth-scroll,
// elsewhere they navigate to the home page section.
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Feature", href: "/#feature" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" },
];
const PREVIEW_HREF = "/preview";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onPreview = pathname === PREVIEW_HREF;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Off the home page, let the link navigate there.
    if (!onHome) return;
    e.preventDefault();

    const hash = href.split("#")[1];
    const targetElement = hash ? document.getElementById(hash) : document.body;
    if (!targetElement) return;

    const targetPosition = hash ? targetElement.getBoundingClientRect().top + window.scrollY : 0;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;
    const duration = 1200; // Slow, luxurious 1.2s scroll

    // Easing function for a slow start and slow end
    const easeInOutCubic = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t * t + b;
      t -= 2;
      return c / 2 * (t * t * t + 2) + b;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const nextPosition = easeInOutCubic(timeElapsed, startPosition, distance, duration);
      
      window.scrollTo(0, nextPosition);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetPosition); // Snap to exact end
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-card-bg/90 backdrop-blur-md border-b border-card-border shadow-sm py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={(e) => handleSmoothScroll(e, "/")}>
            <img 
              src="/images/logo_transparent.png" 
              alt="ApexWall" 
              className="h-16 md:h-20 w-auto object-contain" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center">
            {!onPreview && (
              <PillButton asChild variant="primary" className="gap-2">
                <Link href={PREVIEW_HREF}>
                  <ScanLine className="w-4 h-4" aria-hidden="true" />
                  Preview on Your Wall
                </Link>
              </PillButton>
            )}
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
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-2xl font-display font-medium text-foreground hover:text-primary transition-colors border-b border-card-border pb-4 cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pb-8">
                {!onPreview && (
                  <PillButton asChild variant="primary" className="w-full gap-2 py-3.5">
                    <Link href={PREVIEW_HREF} onClick={() => setIsMobileMenuOpen(false)}>
                      <ScanLine className="w-4 h-4" aria-hidden="true" />
                      Preview on Your Wall
                    </Link>
                  </PillButton>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
