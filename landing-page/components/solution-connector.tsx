"use client"

import { X, ArrowRight } from "lucide-react"
import {
  Home,
  Car,
  Wrench,
  Briefcase,
  Users,
  BookOpen,
  Radio,
  MessageSquare,
  MessageCircle,
  Headphones,
  Mic,
  Mail,
} from "lucide-react"
import { config } from "@/lib/config"

const serviceIcons: Record<string, typeof Home> = {
  LightHouse: Home,
  TrustTransport: Car,
  MechanicMatch: Wrench,
  "Workforce Recruiter": Briefcase,
  SupportMatch: Users,
  Directory: BookOpen,
  SocketRelay: Radio,
  CompareNotes: MessageSquare,
  GentlePulse: Headphones,
  Chyme: Mic,
  "Chat Groups": MessageCircle,
  LostMail: Mail,
}

const serviceDescriptions: Record<string, string> = {
  LightHouse: "Find safe accommodations and escape dangerous living situations",
  TrustTransport: "Get safe rides to avoid public harassment and surveillance",
  MechanicMatch: "Connect with trusted mechanics when your car mysteriously breaks down",
  "Workforce Recruiter": "Track job applications and navigate employment discrimination",
  SupportMatch: "Find accountability partners who understand and can validate your experiences",
  Directory: "Build genuine professional connections away from manipulation",
  SocketRelay: "Get items through community when stores are problematic",
  CompareNotes: "Document patterns, incidents, and share evidence with the community",
  GentlePulse: "Manage stress, anxiety, and wellness when dealing with constant harassment",
  Chyme: "Private voice conversations away from phone surveillance",
  "Chat Groups": "Connect with others experiencing similar situations via Signal",
  LostMail: "Track mail tampering, loss, and delays with detailed incident reports",
}

const serviceUrls: Record<string, string> = {
  LightHouse: "/apps/lighthouse",
  TrustTransport: "/apps/trusttransport",
  MechanicMatch: "/apps/mechanicmatch",
  "Workforce Recruiter": "/apps/workforce-recruiter",
  SupportMatch: "/apps/supportmatch",
  Directory: "/apps/directory",
  SocketRelay: "/apps/socketrelay",
  CompareNotes: "/apps/comparenotes",
  GentlePulse: "/apps/gentlepulse",
  Chyme: "/apps/chyme",
  "Chat Groups": "/apps/chatgroups",
  LostMail: "/apps/lostmail",
}

interface SolutionConnectorProps {
  problem: string
  solutions: string[]
  onClose: () => void
}

export function SolutionConnector({ problem, solutions, onClose }: SolutionConnectorProps) {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full border-[6px] border-foreground bg-card">
        {/* Header */}
        <div className="border-b-[4px] border-foreground bg-secondary p-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-[var(--font-bangers)] text-2xl md:text-3xl mb-2">
              LOOK MA, I FIXED IT!
            </h2>
            <p className="font-[var(--font-inter)] text-sm text-muted-foreground line-clamp-2">
              {problem}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 border-[3px] border-foreground bg-background hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Solutions */}
        <div className="p-6 space-y-6">
          <p className="font-[var(--font-bangers)] text-lg md:text-xl text-center">
            Here's how our platform addresses this:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {solutions.map((solution, index) => {
              const Icon = serviceIcons[solution]
              const description = serviceDescriptions[solution] || "A tool to help address this problem"
              const url = serviceUrls[solution] || "#"

              return (
                <div
                  key={solution}
                  className="border-[3px] border-foreground bg-background p-4 space-y-3 group hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 border-[2px] border-foreground bg-card group-hover:bg-accent-foreground group-hover:text-accent transition-colors">
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-[var(--font-bangers)] text-lg">{solution}</h3>
                      <p className="font-[var(--font-inter)] text-xs text-muted-foreground mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${config.links.app}${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-2 border-[2px] border-foreground bg-card hover:bg-accent-foreground hover:text-accent transition-colors font-[var(--font-inter)] text-sm"
                  >
                    Access {solution}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t-[2px] border-foreground text-center">
            <a
              href={config.links.app}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border-[3px] border-foreground bg-foreground text-background hover:bg-accent hover:text-foreground transition-colors font-[var(--font-bangers)] text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


