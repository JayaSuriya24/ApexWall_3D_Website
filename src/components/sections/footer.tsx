"use client";

import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";
import { siteConfig } from "@/config/site";
import { useState } from "react";
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
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer id="contact" className="pt-20 md:pt-32 pb-12 bg-background px-6 border-t border-card-border">
      <div className="mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <h2 className="font-display font-semibold text-3xl md:text-4xl text-foreground">
            Central Tamil Nadu's Premier <br className="hidden md:block"/> Wall Printing Service
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start mb-24">
          
          {/* Form */}
          <div className="flex flex-col gap-6">
            <h3 className="font-semibold text-foreground text-lg mb-2">Service Area</h3>
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center gap-4 bg-card-bg border border-card-border rounded-xl h-full"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h4 className="font-display font-semibold text-2xl text-foreground">Thank You!</h4>
                  <p className="text-muted text-sm px-6">Your enquiry has been received. We will get back to you shortly.</p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 text-xs font-medium text-primary hover:underline uppercase tracking-widest"
                  >
                    Send another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map */}
          <div className="w-full aspect-square md:aspect-[4/5] rounded-[24px] overflow-hidden border border-card-border relative grayscale hover:grayscale-0 transition-all duration-700">
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

        {/* Footer Bottom Strip */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 border-t border-card-border pt-12">
          
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-2">Contact details</h4>
            <p className="text-muted text-sm">{siteConfig.address}</p>
            <p className="text-muted text-sm">info@apexwall3d.com</p>
            <p className="text-muted text-sm">instagram.com/apexwall3d</p>
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
              <span className="text-primary text-sm font-medium cursor-pointer">See all</span>
            </div>
            <div className="flex gap-3">
              {[
                "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=200&h=200&fit=crop",
                "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=200&h=200&fit=crop",
              ].map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-card-border">
                  <img src={img} alt="Instagram preview" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
