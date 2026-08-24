import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ className, title, subtitle, centered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 mb-12 md:mb-16",
          centered ? "items-center text-center mx-auto max-w-3xl" : "items-start text-left max-w-3xl",
          className
        )}
        {...props}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-glow"
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-muted text-base md:text-lg leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    );
  }
);
SectionHeading.displayName = "SectionHeading";
