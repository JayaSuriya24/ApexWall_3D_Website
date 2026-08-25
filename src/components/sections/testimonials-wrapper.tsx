"use client";

import { useState } from "react";
import { Testimonials, INITIAL_TESTIMONIALS, Testimonial } from "./testimonials";
import { FeedbackForm } from "./feedback-form";

export function TestimonialsWrapper() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);

  const handleAddFeedback = (newFeedback: Testimonial) => {
    // Add the new feedback to the beginning of the list
    setTestimonials((prev) => [newFeedback, ...prev]);
  };

  return (
    <>
      <Testimonials data={testimonials} />
      <FeedbackForm onSubmitFeedback={handleAddFeedback} />
    </>
  );
}
