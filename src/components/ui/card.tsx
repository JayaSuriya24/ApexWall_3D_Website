import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  elevated?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild = false, elevated = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        className={cn(
          "bg-card-bg rounded-[24px] border border-card-border p-6 md:p-8",
          elevated && "shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card };
