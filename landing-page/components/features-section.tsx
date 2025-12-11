import { Shield, Lock, Eye, Heart, Users, Smartphone } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "SAFETY FIRST",
    description: "Invite-only access with robust security measures and comprehensive moderation tools.",
  },
  {
    icon: Lock,
    title: "PRIVACY BY DESIGN",
    description: "Complete data control, and full account deletion options.",
  },
  {
    icon: Eye,
    title: "WCAG AAA",
    description: "Full accessibility compliance with 7:1 contrast ratios and keyboard navigation.",
  },
  {
    icon: Heart,
    title: "TRAUMA-INFORMED",
    description: "No overwhelming animations, predictable interfaces, and respectful design.",
  },
  {
    icon: Users,
    title: "COMMUNITY-DRIVEN",
    description: "Built by and for survivors with continuous community feedback.",
  },
  {
    icon: Smartphone,
    title: "ALL-IN-ONE PLATFORM",
    description: "12+ essential services accessible through a single secure account.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 border-b-[6px] border-foreground">
      <div className="container mx-auto px-4">
        {/* Section header in comic style */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block bg-foreground text-background px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 border-[4px] border-foreground mb-4 sm:mb-6 transform -rotate-1">
            <h2 className="font-[var(--font-bangers)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide">KEY VALUES</h2>
          </div>
          <p className="font-[var(--font-inter)] text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            Every feature is designed with trauma-informed principles, accessibility standards, and user dignity at the
            forefront.
          </p>
        </div>

        {/* Features grid - comic panel style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 border-[4px] border-foreground">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`p-4 sm:p-6 md:p-8 border-[2px] border-foreground bg-card hover:bg-secondary transition-colors group ${
                index % 2 === 0 ? "" : "bg-secondary"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-accent text-accent-foreground p-2 sm:p-2.5 md:p-3 border-[3px] border-foreground flex-shrink-0">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-[var(--font-bangers)] text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 text-foreground">{feature.title}</h3>
                  <p className="font-[var(--font-inter)] text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
