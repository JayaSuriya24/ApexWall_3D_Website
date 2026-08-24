import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = "outline", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-foreground text-card-bg hover:bg-foreground/90": variant === "primary",
            "bg-primary text-white hover:bg-primary/90": variant === "secondary",
            "border border-foreground/20 text-foreground hover:bg-foreground/5": variant === "outline",
          },
          "px-6 py-2.5 md:px-8 md:py-3",
          className
        )}
        {...props}
      />
    );
  }
);
PillButton.displayName = "PillButton";

export { PillButton };
