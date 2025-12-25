import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { ServicesSection } from "@/components/services-section"
import { LookMaSection } from "@/components/look-ma-section"
import { MissionSection } from "@/components/mission-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:border-[3px] focus:border-foreground font-[var(--font-bangers)] text-lg"
      >
        Skip to main content
      </a>
      <main id="main-content" className="min-h-screen bg-background">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <LookMaSection />
        <MissionSection />
        <CTASection />
        <Footer />
      </main>
    </>
  )
}
