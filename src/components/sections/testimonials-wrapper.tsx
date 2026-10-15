"use client";

import { Testimonials, INITIAL_TESTIMONIALS } from "./testimonials";
import { FeedbackForm } from "./feedback-form";

// Reviews shown publicly are curated in INITIAL_TESTIMONIALS; visitor feedback goes to
// the business inbox for review instead of being published automatically.
export function TestimonialsWrapper() {
  return (
    <>
      <Testimonials data={INITIAL_TESTIMONIALS} />
      <FeedbackForm />
    </>
  );
}
