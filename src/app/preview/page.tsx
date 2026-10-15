import type { Metadata } from "next";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { WallPreviewLoader } from "@/components/wall-preview/wall-preview-loader";

export const metadata: Metadata = {
  title: "Preview on Your Wall",
  description:
    "Upload a photo of your wall and see how a mural, photo or logo could look before you book direct-to-wall printing. Free, instant, and your photos stay on your device.",
};

export default function PreviewPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background px-4 pb-16 pt-28 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <header className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Wall Preview</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Preview on Your Wall
            </h1>
            <p className="mt-4 text-base text-muted md:text-lg">
              Upload a photo of your wall, pick a design, and see it in place before we print. It&apos;s free, instant,
              and your photos never leave your device.
            </p>
          </header>
          <WallPreviewLoader />
        </div>
      </main>
      <Footer />
    </>
  );
}
