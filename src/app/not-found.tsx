import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { PillButton } from "@/components/ui/pill-button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 pb-24 pt-36 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-strong">Error 404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          This wall is still blank
        </h1>
        <p className="mt-4 max-w-md text-base text-muted md:text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to something beautiful.
        </p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <PillButton asChild variant="primary">
            <Link href="/">Back to home</Link>
          </PillButton>
          <PillButton asChild variant="outline">
            <Link href="/preview">Preview on Your Wall</Link>
          </PillButton>
          <PillButton asChild variant="outline">
            <Link href="/#gallery">See our work</Link>
          </PillButton>
        </div>
      </main>
    </>
  );
}
