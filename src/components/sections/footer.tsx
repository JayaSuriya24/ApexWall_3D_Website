"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  UploadCloud,
  CheckCircle2,
  Clock
} from "lucide-react";

export function Footer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <footer id="contact" className="pt-20 md:pt-32 relative bg-black/40 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10 mb-20 md:mb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Contact Details & Map */}
          <div className="flex flex-col gap-10">
            <div>
              <SectionHeading
                title="Let's Talk Walls."
                subtitle="Book your free site inspection anywhere in the Trichy region."
                centered={false}
                className="mb-8"
              />
              
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <a href={`tel:${siteConfig.contact.phone}`} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase text-muted font-semibold mb-1">Call Us</span>
                    <span className="text-foreground font-medium">{siteConfig.contact.phone}</span>
                  </div>
                </a>
                
                <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-2xl bg-success/10 hover:bg-success/20 transition-colors border border-success/20">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase text-success/80 font-semibold mb-1">WhatsApp</span>
                    <span className="text-foreground font-medium">Instant Chat</span>
                  </div>
                </a>
              </div>

              <div className="flex items-start gap-4 mb-6 text-muted">
                <MapPin className="w-5 h-5 shrink-0 text-primary mt-1" />
                <div>
                  <span className="text-foreground font-medium block mb-1">Headquarters</span>
                  {siteConfig.address}
                </div>
              </div>
              
              <div className="flex items-start gap-4 text-muted">
                <Clock className="w-5 h-5 shrink-0 text-primary mt-1" />
                <div>
                  <span className="text-foreground font-medium block mb-1">Business Hours</span>
                  Mon - Sat: 9:00 AM - 6:00 PM <br/> Sunday: Closed
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 relative filter grayscale hover:grayscale-0 transition-all duration-700">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125406.10775836262!2d78.61869811910557!3d10.815835695027581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baaf50ff2aec587%3A0x112115994081c70e!2sTiruchirappalli%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Tiruchirappalli Map"
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Lead Gen Form */}
          <GlassCard elevated className="h-fit">
            <h3 className="font-display font-bold text-2xl text-foreground mb-2">Request a Quote</h3>
            <p className="text-muted text-sm mb-8">Upload a photo of your wall for a faster, more accurate 3D mockup and estimate.</p>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="font-display font-bold text-xl text-foreground mb-2">Request Received!</h4>
                  <p className="text-muted">We'll review your details and contact you via WhatsApp within 2 hours.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-xs uppercase text-muted font-semibold tracking-wide">Name *</label>
                      <input id="name" required type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="phone" className="text-xs uppercase text-muted font-semibold tracking-wide">WhatsApp No. *</label>
                      <input id="phone" required type="tel" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="city" className="text-xs uppercase text-muted font-semibold tracking-wide">City/Area *</label>
                      <input id="city" required type="text" placeholder="e.g. Thillai Nagar" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="surface" className="text-xs uppercase text-muted font-semibold tracking-wide">Wall Surface</label>
                      <select id="surface" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                        <option value="emulsion">Smooth Emulsion</option>
                        <option value="brick">Bare Brick / Plaster</option>
                        <option value="wood">Wood / MDF</option>
                        <option value="glass">Glass / Tile</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase text-muted font-semibold tracking-wide">Upload Wall Photo</label>
                    <div className="relative w-full border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors bg-white/5">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <UploadCloud className="w-8 h-8 text-primary mb-3" />
                      {fileName ? (
                        <span className="text-sm text-foreground font-medium">{fileName}</span>
                      ) : (
                        <>
                          <span className="text-sm text-foreground font-medium mb-1">Click to upload or drag and drop</span>
                          <span className="text-xs text-muted">JPEG, PNG up to 10MB</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-xs uppercase text-muted font-semibold tracking-wide">Project Details / Size (Optional)</label>
                    <textarea id="message" rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none" />
                  </div>

                  <GlowButton type="submit" disabled={isSubmitting} className="w-full mt-2">
                    {isSubmitting ? "Submitting..." : "Get Free Quote & Mockup"}
                  </GlowButton>
                </motion.form>
              )}
            </AnimatePresence>
          </GlassCard>

        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              ApexWall<span className="text-primary">3D</span>
            </span>
          </div>
          <p className="text-muted text-sm text-center md:text-left">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Servicing Trichy & Central Tamil Nadu.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
