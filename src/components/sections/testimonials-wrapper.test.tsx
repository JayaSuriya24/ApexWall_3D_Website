import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { Testimonials, type Testimonial } from "./testimonials";
import { FeedbackForm } from "./feedback-form";

const review: Testimonial = { name: "Priya S.", location: "Chennai", project: "Living room mural", text: "Stunning finish", rating: 5 };

// jsdom has no IntersectionObserver; framer-motion's whileInView needs one.
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Testimonials", () => {
  it("shows an invitation instead of an empty carousel when there are no reviews", () => {
    render(<Testimonials data={[]} />);
    expect(screen.getByText(/We'd love to hear how it went/)).toBeDefined();
    expect(screen.queryByLabelText("Next reviews")).toBeNull();
  });

  it("renders curated reviews with labelled scroll buttons", () => {
    render(<Testimonials data={[review]} />);
    expect(screen.getByText("Priya S.")).toBeDefined();
    expect(screen.getByLabelText("5 out of 5 stars")).toBeDefined();
    expect(screen.getByLabelText("Next reviews")).toBeDefined();
  });
});

function fillAndSubmit() {
  fireEvent.click(screen.getByText("Leave Feedback"));
  fireEvent.click(screen.getByLabelText("4 stars"));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Karthik" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "k@example.com" } });
  fireEvent.change(screen.getByLabelText("Your Feedback"), { target: { value: "Great work" } });
  fireEvent.click(screen.getByText("Submit Feedback"));
}

describe("FeedbackForm", () => {
  it("needs a star rating before it can be submitted", () => {
    render(<FeedbackForm />);
    fireEvent.click(screen.getByText("Leave Feedback"));
    expect(screen.getByText("Choose a star rating to continue.")).toBeDefined();
    expect((screen.getByText("Submit Feedback").closest("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("sends the feedback to the business inbox and thanks the visitor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: "true" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<FeedbackForm />);
    fillAndSubmit();
    await waitFor(() => expect(screen.getByText("Thank you!")).toBeDefined());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ name: "Karthik", email: "k@example.com", feedback: "Great work", rating: "4 / 5" });
  });

  it("shows an error, not a thank-you, when sending fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    render(<FeedbackForm />);
    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/couldn't send/));
    expect(screen.queryByText("Thank you!")).toBeNull();
  });
});
