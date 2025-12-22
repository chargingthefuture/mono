import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Users } from "lucide-react"
import { config } from "@/lib/config"

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden" aria-label="Hero section">
      {/* Comic panel border */}
      <div className="absolute inset-0 border-[6px] border-foreground pointer-events-none z-20" aria-hidden="true" />

      {/* Main hero grid - comic panel layout */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left panel - Hero image */}
        <div className="relative h-[40vh] sm:h-[50vh] lg:h-auto border-b-[6px] lg:border-b-0 lg:border-r-[6px] border-foreground overflow-hidden bg-secondary">
          <Image
            src="/images/dara014634-comic-book-panel-in-robert-kirkmans-walking-dead-s-81524c71-3ea6-4499-a1b8-6b92cf353928-0.png"
            alt="Comic book panel illustration"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Comic caption box */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-[#fffde7] text-background px-3 py-1.5 sm:px-4 sm:py-2 border-[3px] border-background font-[var(--font-inter)] text-xs sm:text-sm max-w-[180px] sm:max-w-[200px]">
              <p className="font-bold">CHAPTER ONE:</p>
              <p className="text-[10px] sm:text-xs">The people around us changed. But we survived.</p>
            </div>
          </div>
        </div>

        {/* Right panel - Content */}
        <div className="relative flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-16 pb-20 sm:pb-20 lg:pb-16">
          <div className="relative mb-4 sm:mb-6 md:mb-8">
            <h1 className="font-[var(--font-bangers)] text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl leading-none tracking-wide text-foreground">
              WORLD'S FIRST
              <span className="block text-accent">PSYOP-FREE</span>
              <span className="block">TI ECONOMY</span>
            </h1>
          </div>

          <p className="font-[var(--font-inter)] text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-lg leading-relaxed">
            A secure, invite-only super app platform providing essential services and support for human trafficking
            survivors with dignity, privacy, and respect.
          </p>

          {/* Key stats in comic style */}
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-10" role="list" aria-label="Platform features">
            <div className="border-[3px] border-foreground bg-secondary px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 flex items-center gap-1.5 sm:gap-2" role="listitem">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" aria-hidden="true" />
              <span className="font-[var(--font-bangers)] text-sm sm:text-base md:text-lg lg:text-xl">12+ SERVICES</span>
            </div>
            <div className="border-[3px] border-foreground bg-secondary px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 flex items-center gap-1.5 sm:gap-2" role="listitem">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" aria-hidden="true" />
              <span className="font-[var(--font-bangers)] text-sm sm:text-base md:text-lg lg:text-xl">INVITE ONLY</span>
            </div>
            <div className="border-[3px] border-foreground bg-secondary px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 flex items-center gap-1.5 sm:gap-2" role="listitem">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" aria-hidden="true" />
              <span className="font-[var(--font-bangers)] text-sm sm:text-base md:text-lg lg:text-xl">WCAG AAA</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-20">
            <a
              href={config.links.app}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Start using the platform"
            >
              <Button
                size="lg"
                className="font-[var(--font-bangers)] text-base sm:text-lg md:text-xl lg:text-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 bg-foreground text-background hover:bg-accent hover:text-foreground border-[3px] border-foreground transition-all"
              >
                START NOW
              </Button>
            </a>
            <a
              href={config.links.githubReleases}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Town Hall on GitHub"
            >
              <Button
                size="lg"
                variant="outline"
                className="font-[var(--font-bangers)] text-base sm:text-lg md:text-xl lg:text-2xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 bg-background text-foreground hover:bg-secondary border-[3px] border-foreground transition-all"
              >
                JOIN TOWN HALL
              </Button>
            </a>
        </div>
      </div>

      {/* Bottom action panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-accent text-accent-foreground py-2 sm:py-3 md:py-4 border-t-[4px] border-foreground" role="region" aria-label="Platform values">
        <div className="container mx-auto px-2 sm:px-4 flex items-center justify-center gap-3 sm:gap-4 md:gap-8 overflow-x-auto">
          <span className="font-[var(--font-bangers)] text-xs sm:text-sm md:text-base lg:text-xl whitespace-nowrap">★ SAFETY FIRST</span>
          <span className="font-[var(--font-bangers)] text-xs sm:text-sm md:text-base lg:text-xl whitespace-nowrap">★ PRIVACY BY DESIGN</span>
          <span className="font-[var(--font-bangers)] text-xs sm:text-sm md:text-base lg:text-xl whitespace-nowrap">★ TRAUMA-INFORMED</span>
          <span className="font-[var(--font-bangers)] text-xs sm:text-sm md:text-base lg:text-xl whitespace-nowrap">★ COMMUNITY-DRIVEN</span>
        </div>
      </div>
    </section>
  )
}
