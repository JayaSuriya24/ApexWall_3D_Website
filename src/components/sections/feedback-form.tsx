"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <section className="py-12 md:py-16 relative bg-background px-6">
        <div className="mx-auto max-w-3xl">
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <CheckCircle2 className="w-16 h-16 text-success mb-6" />
            </motion.div>
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">Thank you for your feedback!</h3>
            <p className="text-muted text-lg">
              We appreciate you taking the time to help us improve the ApexWall experience.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 relative bg-background px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="font-display font-semibold text-3xl md:text-4xl text-foreground mb-4">
            Share Your Experience
          </h2>
          <p className="text-muted text-lg">
            Your feedback helps us refine our craftsmanship and elevate our services.
          </p>
        </div>

        <Card className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Rating */}
            <div className="flex flex-col items-center gap-3 mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground"
                  placeholder="e.g. Karthik R."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="feedback" className="text-sm font-medium text-foreground">Your Feedback</label>
              <textarea
                id="feedback"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground resize-none"
                placeholder="Tell us what you loved, or what we could do better..."
              />
            </div>

            <PillButton 
              type="submit" 
              className="w-full md:w-auto md:self-end mt-2 flex items-center justify-center gap-2"
              disabled={isSubmitting}
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
      </div>
    </section>
  );
}
