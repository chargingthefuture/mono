export function MissionSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 border-b-[6px] border-foreground bg-background" aria-labelledby="mission-heading">
      <div className="container mx-auto px-4">
        {/* Section header in comic style */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block bg-foreground text-background px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 border-[4px] border-foreground mb-4 sm:mb-6 transform -rotate-1">
            <h2 id="mission-heading" className="font-[var(--font-bangers)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide">OUR FOUNDATION</h2>
          </div>
        </div>

        {/* Mission, Commitment, Purpose - comic panel style */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Mission */}
          <div className="border-[4px] border-foreground bg-card p-6 sm:p-8 md:p-10">
            <div className="bg-accent text-accent-foreground px-4 py-2 sm:px-5 sm:py-3 border-[3px] border-foreground mb-4 sm:mb-6 inline-block">
              <h3 className="font-[var(--font-bangers)] text-xl sm:text-2xl md:text-3xl tracking-wide">MISSION</h3>
            </div>
            <p className="font-[var(--font-inter)] text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              Charging the Future empowers people to Live, Work, and Prevail with clarity, critical thinking, and authenticity. As pioneers of the world's first psyop-free TI economy, we provide products and services that create a safe, resilient community.
            </p>
          </div>

          {/* Commitment */}
          <div className="border-[4px] border-foreground bg-secondary p-6 sm:p-8 md:p-10">
            <div className="bg-accent text-accent-foreground px-4 py-2 sm:px-5 sm:py-3 border-[3px] border-foreground mb-4 sm:mb-6 inline-block">
              <h3 className="font-[var(--font-bangers)] text-xl sm:text-2xl md:text-3xl tracking-wide">COMMITMENT</h3>
            </div>
            <p className="font-[var(--font-inter)] text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              We support one another through life's challenges and make choices aligned with our core values so everyone can live without fear.
            </p>
          </div>

          {/* Purpose */}
          <div className="border-[4px] border-foreground bg-card p-6 sm:p-8 md:p-10">
            <div className="bg-accent text-accent-foreground px-4 py-2 sm:px-5 sm:py-3 border-[3px] border-foreground mb-4 sm:mb-6 inline-block">
              <h3 className="font-[var(--font-bangers)] text-xl sm:text-2xl md:text-3xl tracking-wide">PURPOSE</h3>
            </div>
            <p className="font-[var(--font-inter)] text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              We exist to prevent human trafficking and its harms by building a sustainable, ethical marketplace that restores agency, heals survivors, and enables all people to thrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
