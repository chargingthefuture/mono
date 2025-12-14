export function Footer() {
  return (
    <footer className="border-t-[6px] border-foreground bg-card">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-[var(--font-bangers)] text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 md:mb-4 text-foreground">PSYOP-FREE ECONOMY</h3>
            <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Built with care, respect, and dedication to serving the survivor community. Every feature is designed with
              trauma-informed principles.
            </p>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="font-[var(--font-bangers)] text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 text-foreground">PLATFORM STATUS</h4>
            <ul className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                Active and continuously improving
              </li>
              <a href="https://github.com/chargingthefuture"
                              target="_blank"
                rel="noopener noreferrer"><li>Access: Open source code</li></a>
              <a href="https://chargingthefuture.discourse.group"
                              target="_blank"
                rel="noopener noreferrer"><li>Support: Townsquare</li></a>
              <a href="https://signal.group/#CjQKILHj7074l2Kl-oYy0qGSFdydXbtu0Pf66Z_88K9IlSCtEhDDdqV_BFAW2qm2EiTGEaNs"
                              target="_blank"
                rel="noopener noreferrer"><li>Chat: Signal group</li></a>
              <a href="https://chargingthefuture.github.io/mono/"
                              target="_blank"
                rel="noopener noreferrer"><li>Status: Platform status</li></a>
            </ul>
          </div>

          {/* Privacy Commitment */}
          <div>
            <h4 className="font-[var(--font-bangers)] text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 text-foreground">PRIVACY COMMITMENT</h4>
            <ul className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
              <li>✓ Complete account deletion</li>
              <li>✓ Data anonymization</li>
              <li>✓ We never sell data</li>
              <li>✓ Regular security audits</li>
            </ul>
          </div>
        </div>

        <div className="border-t-[3px] border-foreground mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground text-center md:text-left">
            © 2025 Charging The Future. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="https://app.chargingthefuture.com/terms"
                              target="_blank"
                rel="noopener noreferrer"
              className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="https://app.chargingthefuture.com/terms"
                              target="_blank"
                rel="noopener noreferrer"
              className="font-[var(--font-inter)] text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
