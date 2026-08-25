import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { ServiceVerticals } from "@/components/sections/service-verticals";
import { ComparisonMatrix } from "@/components/sections/comparison-matrix";
import { CostEstimator } from "@/components/sections/cost-estimator";
import { ProjectGallery } from "@/components/sections/project-gallery";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { SplashScreen } from "@/components/ui/splash-screen";

export default function Home() {
  return (
    <>
      <SplashScreen />
      <Navbar />
      <main className="flex min-h-screen flex-col pb-24">
        <Hero />
        <ServiceVerticals />
        <ComparisonMatrix />
        <CostEstimator />
        <ProjectGallery />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
