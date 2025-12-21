import { Button } from "@/components/ui/button"
import { Lock, Shield, Eye } from "lucide-react"
import { config } from "@/lib/config"

export function CTASection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 relative overflow-hidden" aria-label="Call to action">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 11px
          )`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA box */}
          <div className="border-[6px] border-foreground bg-card p-4 sm:p-6 md:p-8 lg:p-12 relative">
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-accent border-[3px] border-foreground" />
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-accent border-[3px] border-foreground" />
            <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-accent border-[3px] border-foreground" />
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-accent border-[3px] border-foreground" />

            <h2 className="font-[var(--font-bangers)] text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl mb-4 sm:mb-5 md:mb-6 text-foreground leading-tight">
              THIS PLATFORM IS
              <span className="block text-accent">INVITE-ONLY</span>
            </h2>

            <p className="font-[var(--font-inter)] text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
              Sign-up with just an email address and an admin will approve your account to begin accessing services immediately.
              All services are designed with your safety and privacy as the top priority.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span className="font-[var(--font-inter)] text-xs sm:text-sm">Complete Data Control</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span className="font-[var(--font-inter)] text-xs sm:text-sm">No Data Selling</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span className="font-[var(--font-inter)] text-xs sm:text-sm">Transparent Policies</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <a
                href={config.links.app}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Start using the platform"
              >
                <Button
                  size="lg"
                  className="font-[var(--font-bangers)] text-base sm:text-lg md:text-xl lg:text-2xl px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 bg-accent text-accent-foreground hover:bg-foreground hover:text-background border-[4px] border-foreground transition-all"
                >
                  START NOW
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
