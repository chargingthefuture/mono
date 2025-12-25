"use client"

import { useState } from "react"
import Image from "next/image"
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
  CheckCircle2,
} from "lucide-react"

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

interface ProblemCardProps {
  problem: string
  solutions: string[]
  isSelected: boolean
  onSelect: () => void
  onSolutionHover: (solution: string | null) => void
  hoveredSolution: string | null
  imagePlaceholder: string
}

export function ProblemCard({
  problem,
  solutions,
  isSelected,
  onSelect,
  onSolutionHover,
  hoveredSolution,
  imagePlaceholder,
}: ProblemCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className={`border-[4px] border-foreground bg-card transition-all cursor-pointer group ${
        isSelected ? "ring-4 ring-accent scale-105 z-10 relative" : "hover:border-accent"
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Problem: ${problem.substring(0, 50)}...`}
    >
      {/* Image placeholder - will be replaced with Midjourney graphics */}
      <div className="relative w-full h-48 bg-muted border-b-[4px] border-foreground overflow-hidden">
        {!imageError ? (
          <Image
            src={imagePlaceholder}
            alt=""
            fill
            className="object-cover group-hover:scale-110 transition-transform"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/20">
            <span className="font-[var(--font-bangers)] text-4xl text-muted-foreground">?</span>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-accent border-[3px] border-foreground p-2">
            <CheckCircle2 className="w-6 h-6 text-foreground" />
          </div>
        )}
      </div>

      {/* Problem Text */}
      <div className="p-4 space-y-3">
        <p className="font-[var(--font-inter)] text-sm leading-relaxed line-clamp-3">
          {problem}
        </p>

        {/* Solutions Preview */}
        {isSelected && (
          <div className="pt-3 border-t-[2px] border-foreground space-y-2">
            <p className="font-[var(--font-bangers)] text-xs uppercase text-muted-foreground">
              Solutions:
            </p>
            <div className="flex flex-wrap gap-2">
              {solutions.map((solution) => {
                const Icon = serviceIcons[solution]
                const isHovered = hoveredSolution === solution
                return (
                  <div
                    key={solution}
                    className={`flex items-center gap-1.5 px-2 py-1 border-[2px] border-foreground bg-background transition-all ${
                      isHovered ? "bg-accent scale-110" : "hover:bg-accent/50"
                    }`}
                    onMouseEnter={() => onSolutionHover(solution)}
                    onMouseLeave={() => onSolutionHover(null)}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span className="font-[var(--font-inter)] text-xs">{solution}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


