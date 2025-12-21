/**
 * Configuration for external URLs and app settings
 * Centralized to make updates easier and support different environments
 */

export const config = {
  app: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.chargingthefuture.com",
  },
  links: {
    app: "https://app.chargingthefuture.com",
    github: "https://github.com/chargingthefuture",
    githubReleases: "https://github.com/chargingthefuture/mono/releases/",
    discourse: "https://chargingthefuture.discourse.group",
    signalGroup: "https://signal.group/#CjQKILHj7074l2Kl-oYy0qGSFdydXbtu0Pf66Z_88K9IlSCtEhDDdqV_BFAW2qm2EiTGEaNs",
    statusPage: "https://chargingthefuture.github.io/mono/",
    terms: "https://app.chargingthefuture.com/terms",
    privacy: "https://app.chargingthefuture.com/privacy",
  },
} as const

