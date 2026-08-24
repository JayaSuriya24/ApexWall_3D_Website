import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { BeforeAfterSlider } from "@/components/sections/before-after-slider";
import { ServiceVerticals } from "@/components/sections/service-verticals";
import { ComparisonMatrix } from "@/components/sections/comparison-matrix";
import { CostEstimator } from "@/components/sections/cost-estimator";
import { ProjectGallery } from "@/components/sections/project-gallery";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { LaserDivider } from "@/components/ui/laser-divider";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col">
        <Hero />
        <LaserDivider />
        <BeforeAfterSlider />
        <LaserDivider />
        <ServiceVerticals />
        <LaserDivider />
        <ComparisonMatrix />
        <LaserDivider />
        <CostEstimator />
        <LaserDivider />
        <ProjectGallery />
        <LaserDivider />
        <HowItWorks />
        <LaserDivider />
        <Testimonials />
        <LaserDivider />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
