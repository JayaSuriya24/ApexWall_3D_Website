"use client";

import { useState, useEffect } from "react";
import { Testimonials, INITIAL_TESTIMONIALS, Testimonial } from "./testimonials";
import { FeedbackForm } from "./feedback-form";

export function TestimonialsWrapper() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("apexwall-testimonials");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonials(parsed);
        }
      } catch (e) {
        console.error("Failed to parse testimonials from local storage", e);
      }
    }
  }, []);

  const handleAddFeedback = (newFeedback: Testimonial) => {
    setTestimonials((prev) => {
      const updated = [newFeedback, ...prev];
      localStorage.setItem("apexwall-testimonials", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      <Testimonials data={testimonials} />
      <FeedbackForm onSubmitFeedback={handleAddFeedback} />
    </>
  );
}
