"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle2, MessageSquarePlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";

export function FeedbackForm({ onSubmitFeedback }: { onSubmitFeedback?: (feedback: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const newFeedback = {
      name: formData.get("name") as string,
      location: "Recent Client",
      project: "Custom Wall Print",
      text: formData.get("feedback") as string,
      rating: rating,
    };

    // Simulate API call
    setTimeout(() => {
      if (onSubmitFeedback) {
        onSubmitFeedback(newFeedback);
      }
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        // Reset form after closing
        setTimeout(() => {
          setIsSubmitted(false);
          setRating(0);
        }, 500);
      }, 3000);
    }, 1500);
  };

  return (
    <section className="py-12 relative bg-background px-6 flex justify-center border-t border-card-border/50">
      <PillButton 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-8 py-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
      >
        <MessageSquarePlus className="w-5 h-5" />
        Leave Feedback
      </PillButton>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-2xl z-10"
            >
              {isSubmitted ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-primary/20 shadow-2xl relative overflow-hidden">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-success mb-6" />
                  </motion.div>
                  <h3 className="font-display text-3xl font-bold text-foreground mb-4">Thank you!</h3>
                  <p className="text-muted text-lg">
                    We appreciate you taking the time to help us improve the ApexWall experience.
                  </p>
                </Card>
              ) : (
                <Card className="p-6 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="mb-8 text-center pr-8 pl-8">
                    <h2 className="font-display font-semibold text-2xl md:text-3xl text-foreground mb-2">
                      Share Your Experience
                    </h2>
                    <p className="text-muted">
                      Your feedback helps us refine our craftsmanship.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Rating */}
                    <div className="flex flex-col items-center gap-3 mb-2">
                      <label className="text-sm font-medium text-foreground uppercase tracking-widest">Rate Your Experience</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoveredRating || rating)
                                  ? "text-primary fill-primary"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground"
                          placeholder="e.g. Karthik R."
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground"
                          placeholder="hello@example.com"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="feedback" className="text-sm font-medium text-foreground">Your Feedback</label>
                      <textarea
                        id="feedback"
                        name="feedback"
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground resize-none"
                        placeholder="Tell us what you loved, or what we could do better..."
                      />
                    </div>

                    <PillButton 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 mt-2"
                      disabled={isSubmitting || rating === 0}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Feedback
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </PillButton>
                  </form>
                </Card>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
