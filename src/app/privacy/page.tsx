import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/sections/navbar";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your phone number and enquiry details.`,
};

// Plain-language notice for India's Digital Personal Data Protection Act, 2023.
// Review with the business (and a lawyer if needed) before launch.
const UPDATED = "16 October 2026";

export default function PrivacyPage() {
  const { email, whatsapp } = siteConfig.contact;
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background px-6 pb-20 pt-32">
        <article className="mx-auto max-w-2xl text-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Privacy Policy</h1>
          <p>Last updated {UPDATED}.</p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong className="text-foreground">Your mobile number</strong>, when you verify it with a one-time code to download or
              share a wall preview, ask for a quote, or send us a message.
            </li>
            <li>The details you choose to send: name, email, message, and the design, wall size and estimate from your preview.</li>
            <li>When you verified, the page you were on, and your browser type, to keep the service secure.</li>
          </ul>
          <p>
            Photos you upload to the Wall Preview stay on your device. They are not uploaded to us unless you choose to share or send
            your mockup.
          </p>

          <h2>Why we use it</h2>
          <ul>
            <li>To reply to your enquiry and send you a quote.</li>
            <li>To confirm the number is really yours, and to stop spam and misuse of our verification service.</li>
          </ul>
          <p>We never sell or share your number for marketing by others.</p>

          <h2>Who handles it for us</h2>
          <ul>
            <li>Our SMS provider, to deliver your one-time code.</li>
            <li>Our database provider, to store your number and enquiry securely.</li>
            <li>Our email form service, to deliver your message to our inbox.</li>
          </ul>

          <h2>How long we keep it</h2>
          <p>
            One-time codes are deleted as soon as they are used or expire. Your number and enquiry details are kept for as long as
            needed to serve your enquiry, and deleted on request.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask to see, correct or delete your information, or withdraw your consent, at any time. Email{" "}
            <a href={`mailto:${email}`} className="underline hover:text-foreground">
              {email}
            </a>{" "}
            or message us on{" "}
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              WhatsApp
            </a>
            , and we will act on it promptly.
          </p>

          <p className="!mt-12">
            <Link href="/" className="underline hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </article>
      </main>
    </>
  );
}
