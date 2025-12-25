import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wrench, ArrowRight } from "lucide-react"

export function LookMaSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-accent border-b-[6px] border-foreground" aria-labelledby="look-ma-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block relative mb-4">
              <div className="absolute inset-0 bg-background transform rotate-3 -z-10 scale-110" />
              <div className="bg-foreground text-background px-6 py-3 md:px-10 md:py-5 border-[4px] border-foreground relative">
                <h2 id="look-ma-heading" className="font-[var(--font-bangers)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide">
                  LOOK MA, I FIXED IT!
                </h2>
              </div>
            </div>
            <p className="font-[var(--font-inter)] text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
              Every problem you've experienced has a solution. Explore our interactive map of problems and solutions.
            </p>
          </div>

          {/* Content Card */}
          <div className="border-[6px] border-foreground bg-card p-6 sm:p-8 md:p-12 relative">
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-background border-[3px] border-foreground" />
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-background border-[3px] border-foreground" />
            <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-background border-[3px] border-foreground" />
            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-background border-[3px] border-foreground" />

            <div className="space-y-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 border-[3px] border-foreground bg-secondary">
                  <Wrench className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-accent" />
                </div>
              </div>

              <p className="font-[var(--font-inter)] text-sm sm:text-base md:text-lg text-center text-muted-foreground leading-relaxed">
                We've mapped every problem you've faced to real solutions in our platform. Click on any problem to see how our tools address it.
                Each solution is a working feature built specifically for survivors.
              </p>

              <div className="flex justify-center pt-4">
                <Link href="/look-ma-i-fixed-it">
                  <Button
                    size="lg"
                    className="font-[var(--font-bangers)] text-base sm:text-lg md:text-xl lg:text-2xl px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 bg-foreground text-background hover:bg-accent hover:text-foreground border-[4px] border-foreground transition-all"
                  >
                    EXPLORE SOLUTIONS
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

