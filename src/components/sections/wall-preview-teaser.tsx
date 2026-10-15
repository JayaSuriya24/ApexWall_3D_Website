"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Camera, MessageCircle, Palette, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";

const STEPS = [
  { icon: Camera, title: "Snap your wall", text: "Upload a photo from your phone or computer." },
  { icon: Palette, title: "Pick a design", text: "Choose one of ours or upload your own art or logo." },
  { icon: MessageCircle, title: "Get a quote", text: "Share the mockup with us on WhatsApp." },
];

// The visible wall in hero-before.jpg / hero-after.jpg, as % of the image.
const WALL = { left: 16, top: 14, right: 97, bottom: 56 };

export function WallPreviewTeaser() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="wall-preview" className="scroll-mt-24 bg-background px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Card className="grid items-center gap-10 overflow-hidden p-6 md:p-10 lg:grid-cols-2 lg:gap-14 lg:p-12">
          <div className="flex flex-col items-start">
            <span className="mb-4 rounded-full bg-highlight px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              New · Wall Preview
            </span>
            <h2 className="font-display text-3xl font-semibold leading-tight text-foreground md:text-4xl lg:text-5xl">
              See it on your wall before we print
            </h2>
            <p className="mt-4 text-base text-muted md:text-lg">
              Try any design on a photo of your own wall in seconds. Line it up with the corners, choose a shape, and
              get a size and price estimate.
            </p>

            <ol className="mt-8 flex w-full flex-col gap-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      <span className="sr-only">Step {i + 1}: </span>
                      {title}
                    </p>
                    <p className="text-sm text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <PillButton asChild variant="primary" className="mt-8 w-full gap-2 sm:w-auto">
              <Link href="/preview">
                Preview on Your Wall
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </PillButton>
            <p className="mt-3 text-xs text-muted">Free · No sign-up · Your photos stay on your device</p>
          </div>

          {/* Visual: the editor's corner handles on a real room, with the mural fading in */}
          <Link
            href="/preview"
            aria-label="Open the wall preview: a living room wall shown bare and then with a floral mural"
            className="group relative order-first block aspect-square overflow-hidden rounded-[20px] border border-card-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:aspect-[4/3] lg:order-none lg:aspect-square"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- matches the rest of the site */}
            <img
              src="/images/hero-before.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <motion.img
              src="/images/hero-after.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 0, 1, 1, 0] }}
              transition={reduceMotion ? undefined : { duration: 7, times: [0, 0.2, 0.35, 0.85, 1], repeat: Infinity }}
            />
            <div
              className="pointer-events-none absolute border-2 border-dashed border-primary"
              style={{
                left: `${WALL.left}%`,
                top: `${WALL.top}%`,
                right: `${100 - WALL.right}%`,
                bottom: `${100 - WALL.bottom}%`,
              }}
            >
              {["-left-2 -top-2", "-right-2 -top-2", "-right-2 -bottom-2", "-left-2 -bottom-2"].map((pos) => (
                <span
                  key={pos}
                  className={`absolute ${pos} h-4 w-4 rounded-full border-[3px] border-primary bg-white shadow`}
                />
              ))}
            </div>
            <span className="absolute bottom-3 left-3 rounded-full bg-foreground/75 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors group-hover:bg-foreground">
              Try it with your own photo →
            </span>
          </Link>
        </Card>
      </div>
    </section>
  );
}
