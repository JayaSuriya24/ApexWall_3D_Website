"use client";

import dynamic from "next/dynamic";

// The editor uses canvas, file and pointer APIs only, so it is never prerendered.
export const WallPreviewLoader = dynamic(
  () => import("./wall-preview-editor").then((m) => m.WallPreviewEditor),
  {
    ssr: false,
    loading: () => (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8" aria-busy="true">
        <div className="min-h-[52vh] animate-pulse rounded-[24px] border border-card-border bg-card-bg lg:min-h-[64vh]" />
        <div className="hidden flex-col gap-4 lg:flex">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-[20px] border border-card-border bg-card-bg" />
          ))}
        </div>
        <span className="sr-only">Loading the wall preview…</span>
      </div>
    ),
  },
);
