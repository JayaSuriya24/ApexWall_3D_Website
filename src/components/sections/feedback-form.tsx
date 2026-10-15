"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle2, MessageSquarePlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";
import { siteConfig } from "@/config/site";
import { submitForm } from "@/lib/submit-form";
import { useOverlay } from "@/lib/use-overlay";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground";

/**
 * Sends a visitor's rating and feedback to the business inbox. Reviews shown on the
 * site are curated separately (see INITIAL_TESTIMONIALS), not published automatically.
 */
export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const close = () => {
    setIsOpen(false);
    if (status === "sent") {
      setStatus("idle");
      setRating(0);
    }
  };
  useOverlay(isOpen, close);

  // Close automatically a few seconds after a successful send.
  useEffect(() => {
    if (status !== "sent") return;
    const timer = setTimeout(() => {
      setIsOpen(false);
      setStatus("idle");
      setRating(0);
    }, 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      await submitForm({
        _subject: `Website feedback: ${rating}/5 from ${data.get("name")}`,
        rating: `${rating} / 5`,
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        feedback: String(data.get("feedback") ?? ""),
      });
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-12 relative bg-background px-6 flex justify-center border-t border-card-border/50">
      <PillButton
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-8 py-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
      >
        <MessageSquarePlus className="w-5 h-5" aria-hidden="true" />
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
              onClick={close}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
              className="relative w-full max-w-2xl z-10"
            >
              {status === "sent" ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-2 border-primary/20 shadow-2xl relative overflow-hidden">
                  <CloseButton onClick={close} />
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                    <CheckCircle2 className="w-16 h-16 text-success mb-6" aria-hidden="true" />
                  </motion.div>
                  <h3 id="feedback-title" className="font-display text-3xl font-bold text-foreground mb-4" role="status">
                    Thank you!
                  </h3>
                  <p className="text-muted text-lg">
                    We appreciate you taking the time to help us improve the ApexWall experience.
                  </p>
                </Card>
              ) : (
                <Card className="p-6 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <CloseButton onClick={close} />

                  <div className="mb-8 text-center px-8">
                    <h2 id="feedback-title" className="font-display font-semibold text-2xl md:text-3xl text-foreground mb-2">
                      Share Your Experience
                    </h2>
                    <p className="text-muted">Your feedback helps us refine our craftsmanship.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Rating */}
                    <fieldset className="flex flex-col items-center gap-3 mb-2">
                      <legend className="mb-3 text-center text-sm font-medium text-foreground uppercase tracking-widest">
                        Rate Your Experience
                      </legend>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            aria-label={`${star} star${star > 1 ? "s" : ""}`}
                            aria-pressed={rating === star}
                            className="p-1 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Star
                              aria-hidden="true"
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoveredRating || rating) ? "text-primary fill-primary" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating === 0 && <p className="text-xs text-muted">Choose a star rating to continue.</p>}
                    </fieldset>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="feedback-name" className="text-sm font-medium text-foreground">Name</label>
                        <input type="text" id="feedback-name" name="name" required autoComplete="name" className={inputClass} placeholder="e.g. Karthik R." />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="feedback-email" className="text-sm font-medium text-foreground">Email</label>
                        <input type="email" id="feedback-email" name="email" required autoComplete="email" className={inputClass} placeholder="hello@example.com" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="feedback-text" className="text-sm font-medium text-foreground">Your Feedback</label>
                      <textarea
                        id="feedback-text"
                        name="feedback"
                        required
                        rows={3}
                        className={`${inputClass} py-3 resize-none`}
                        placeholder="Tell us what you loved, or what we could do better..."
                      />
                    </div>

                    {status === "error" && (
                      <p role="alert" className="text-sm text-[#b5523b]">
                        Sorry, we couldn&apos;t send your feedback. Please try again, or message us on{" "}
                        <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline">
                          WhatsApp
                        </a>
                        .
                      </p>
                    )}

                    <PillButton
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 mt-2"
                      disabled={status === "sending" || rating === 0}
                    >
                      {status === "sending" ? (
                        <>
                          <span className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" aria-hidden="true" />
                          <span className="sr-only">Sending…</span>
                        </>
                      ) : (
                        <>
                          Submit Feedback
                          <Send className="w-4 h-4" aria-hidden="true" />
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

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <X className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
