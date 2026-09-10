"use client";

import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";
import { siteConfig } from "@/config/site";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Footer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);
  return (
    <footer id="contact" className="pt-20 md:pt-32 pb-12 bg-background px-6 border-t border-card-border">
      <div className="mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h2 className="font-display font-semibold text-3xl md:text-4xl text-foreground">
            India's Premier <br className="hidden md:block"/> Wall Printing Service
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-24">
          
          {/* WhatsApp Section */}
          <div className="flex flex-col justify-center items-start bg-card-bg border border-card-border rounded-3xl p-8 md:p-12">
            <div className="mb-8">
              <h3 className="font-display font-semibold text-2xl md:text-3xl text-foreground mb-4">Book a Walkthrough</h3>
              <p className="text-muted leading-relaxed">
                Have a project in mind? Chat with us directly on WhatsApp to schedule a walkthrough and discuss your requirements.
              </p>
            </div>
            
            <div className="flex flex-col items-start gap-4">
              <p className="text-foreground font-medium">
                Simply drop us a quick hello to get started.
              </p>
              
              <a 
                href="https://wa.me/919840765477?text=Hi!%20I%20would%20like%20to%20book%20a%20walkthrough."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-8 py-4 rounded-full transition-colors shadow-lg shadow-[#25D366]/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat on WhatsApp
              </a>
              
              <p className="text-sm text-muted mt-1">
                Our experts will handle the rest and guide you every step of the way.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6 w-full">
            <h3 className="font-semibold text-foreground text-lg mb-2">Send us a Message</h3>
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="contact-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4" 
                  action="https://formsubmit.co/jayasuriyamanickavasagam@gmail.com" 
                  method="POST"
                  onSubmit={handleSubmit}
                >
                  <input 
                    type="text"
                    name="name"
                    required 
                    placeholder="Name" 
                    className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors" 
                  />
                  <input 
                    type="email" 
                    name="email"
                    required
                    placeholder="Email" 
                    className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors" 
                  />
                  <textarea 
                    name="message"
                    required
                    rows={4} 
                    placeholder="Message" 
                    className="w-full bg-card-bg border border-card-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors resize-none" 
                  />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_subject" value="New Website Enquiry - ApexWall 3D" />
                  
                  <PillButton type="submit" variant="outline" className="w-full mt-2" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Submit"}
                  </PillButton>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-message"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center py-8 text-center gap-4 bg-card-bg border border-card-border rounded-xl h-full"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h4 className="font-display font-semibold text-2xl text-foreground">Thank You!</h4>
                  <p className="text-muted text-sm px-6">Your enquiry has been received. We will get back to you shortly.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


        </div>

        {/* Footer Bottom Strip */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 border-t border-card-border pt-12">
          
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Contact details</h4>

            <p className="text-muted text-sm">info@apexwall3d.com</p>
            <p className="text-muted text-sm">+91 9840765477</p>
            <div className="flex gap-4 mt-4 text-muted">
              {/* FB SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              {/* IG SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              {/* YT SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 hover:text-foreground cursor-pointer transition-colors"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Instagram</h4>
            </div>
            <div className="flex gap-3">
              {[
                { src: "/images/direct-to-wall.jpg", link: "https://instagram.com/apexwall3d", name: "ApexWall 3D" },
                { src: "/images/architects_bg.jpg", link: "https://www.instagram.com/nav_associates_/", name: "Nav-Arc" },
              ].map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden border border-card-border block group">
                  <img src={item.src} alt="Instagram preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-medium text-center px-1">{item.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
