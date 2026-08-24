import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot"; // Let me use this for asChild pattern or just standard. I will use standard first.

export interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-background hover:bg-primary/90 glow-curing": variant === "primary",
            "bg-secondary text-foreground hover:bg-secondary/90": variant === "secondary",
            "border border-primary/50 text-primary hover:bg-primary/10": variant === "outline",
          },
          "px-6 py-3 md:px-8 md:py-4", // Default sizes
          className
        )}
        {...props}
      />
    );
  }
);
GlowButton.displayName = "GlowButton";

export { GlowButton };
