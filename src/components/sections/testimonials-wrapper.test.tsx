import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestimonialsWrapper } from "./testimonials-wrapper";

// Mock the child components to simplify testing the wrapper logic
vi.mock("./testimonials", () => ({
  Testimonials: ({ data }: { data: any }) => (
    <div data-testid="testimonials-mock">
      {data.map((t: any, i: number) => (
        <div key={i} data-testid="testimonial-item">
          {t.name} - {t.content}
        </div>
      ))}
    </div>
  ),
  INITIAL_TESTIMONIALS: [{ name: "Initial User", content: "Initial Content", role: "Role", location: "Loc", rating: 5 }]
}));

vi.mock("./feedback-form", () => ({
  FeedbackForm: ({ onSubmitFeedback }: { onSubmitFeedback: any }) => (
    <button
      data-testid="add-feedback-btn"
      onClick={() =>
        onSubmitFeedback({
          name: "New User",
          content: "New Content",
          role: "New Role",
          location: "New Loc",
          rating: 5,
        })
      }
    >
      Add Feedback
    </button>
  ),
}));

describe("TestimonialsWrapper", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders initial testimonials when localStorage is empty", () => {
    render(<TestimonialsWrapper />);
    expect(screen.getByTestId("testimonials-mock")).toBeDefined();
    expect(screen.getByText("Initial User - Initial Content")).toBeDefined();
  });

  it("loads testimonials from localStorage if available", () => {
    const savedData = [
      {
        name: "Saved User",
        content: "Saved Content",
        role: "Saved Role",
        location: "Saved Loc",
        rating: 5,
      },
    ];
    localStorage.setItem("apexwall-feedback", JSON.stringify(savedData));

    render(<TestimonialsWrapper />);
    expect(screen.getByText("Saved User - Saved Content")).toBeDefined();
    // It shouldn't render the initial one if localStorage overrides it
  });

  it("adds new feedback and saves to localStorage", () => {
    render(<TestimonialsWrapper />);
    
    const addBtn = screen.getByTestId("add-feedback-btn");
    fireEvent.click(addBtn);

    // It should now render the new user
    expect(screen.getByText("New User - New Content")).toBeDefined();

    // It should have saved it to localStorage
    const saved = JSON.parse(localStorage.getItem("apexwall-feedback") || "[]");
    expect(saved[0].name).toBe("New User");
  });
});
