"use client"

import { useState } from "react"
import { ProblemCard } from "@/components/problem-card"
import { SolutionConnector } from "@/components/solution-connector"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const problemSolutions: Record<string, string[]> = {
  "Do idiots constantly try to get close to you physically, while aiming their cell phones at you and/or staring at their cell phones while invading your personal space?": [
    "Chat Groups",
    "GentlePulse",
    "Chyme",
  ],
  "Do your co-workers that you have always been friendly with, suddenly start acting strange towards you and distancing themselves from you? Are they lie about your work performance, try to get you to quit or begin bumping shoulders with you?": [
    "Workforce Recruiter",
    "Directory",
  ],
  "Do idiots sit parked in their cars outside your home all the time?": [
    "LightHouse",
  ],
  "Do morons constantly get in your way and block you from where you are going out in public?/cut you in line?/hold up the line?": [
    "SocketRelay",
    "Directory",
    "Workforce Recruiter",
  ],
  "Did all your neighbors suddenly move, have their houses quickly sold and construction work done on them, then quickly have 'new neighbors' (who don't really seem to live there move in)?": [
    "LightHouse",
  ],
  "Have any new street lamps/antennas been installed around your home/work recently?": [
    "LightHouse",
  ],
  "Do drones hover around you /your home/work/all the time?": [
    "LightHouse",
  ],
  "Do you experience tinnitus/ringing in ears?": [
    "GentlePulse",
    "CompareNotes",
    "Directory",
    "Workforce Recruiter",
  ],
  "Do police officers follow/harass you for no good reason?": [
    "GentlePulse",
    "CompareNotes",
    "Chat Groups",
    "Directory",
    "Chyme",
  ],
  "Do your neighbors always seem to come outside when you are there, then go inside when you do?": [
    "LightHouse",
  ],
  "Do different people seem to be coming and going from neighbors houses around you all the time?": [
    "LightHouse",
  ],
  "Do several of your neighbors have strange colored lights coming out their windows at night?": [
    "LightHouse",
  ],
  "Do people you don't know stare at you strangely/treat you bad for no reason?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "CompareNotes",
  ],
  "Are new people pushing hard for you to be their new 'friend/roommate/romantic partner?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "Chyme",
  ],
  "Do people seem to know things about you that you have never told them before?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "Chyme",
  ],
  "Do people you don't know constantly try to talk to you/befriend you while you are out in public?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "Chyme",
  ],
  "Do strange things happen around you a lot? (people fighting/arguing in the streets/causing scenes that seem staged?": [
    "CompareNotes",
    "LightHouse",
  ],
  "Do you get denied jobs/housing for no good reason?": [
    "Workforce Recruiter",
    "Directory",
    "LightHouse",
  ],
  "Do you live close to a freemason lodge? Or know someone who is a freemason?": [
    "CompareNotes",
    "LightHouse",
  ],
  "Does trying to do simple things like fill out an online job application become an ordeal due to endless clicking that brings you nowhere? or website conveniently won't load when you try to submit applications or important documents?": [
    "Workforce Recruiter",
    "Directory",
    "CompareNotes",
  ],
  "Do doctors deny you proper care?/ghost you?/tell you you are fine when you know something is wrong?/not get back to you with test results, then claim to have never received them, or have 'no record' of them.": [
    "Workforce Recruiter",
    "Directory",
  ],
  "Do you hear strange humming/buzzing noises/sound of a machine running around you a lot, but can't pinpoint exactly where it's coming from?": [
    "CompareNotes",
    "GentlePulse",
  ],
  "Does your mail get lost/tampered with a lot?": [
    "LostMail",
    "CompareNotes",
    "Workforce Recruiter",
    "Directory",
  ],
  "Do you get tired more than you should?": [
    "GentlePulse",
    "CompareNotes",
  ],
  "Do people try to bait you into doing drugs? buying guns? buying self-defense gear? drinking? committing illegal acts?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "CompareNotes",
    "Chyme",
  ],
  "If you are a woman, do perverted guys you don't know or just met straight up ask you for sex?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "CompareNotes",
    "Chyme",
  ],
  "If you are sitting in your car minding your own business do idiots come and park right by/next to you and sit there too? usually buried in their phone? even if you are parked in an isolated area?": [
    "SupportMatch",
    "Chat Groups",
    "GentlePulse",
    "CompareNotes",
    "Chyme",
  ],
  "Do idiots constantly shine their bright headlights/flashlights/dews on you?": [
    "CompareNotes",
    "TrustTransport",
  ],
  "Do you often pull up to an empty store, and then it suddenly becomes busy after you go in? even at non busy business hours?": [
    "SocketRelay",
    "Workforce Recruiter",
    "Directory",
  ],
  "Do weirdos try to get you to say bad things about other people? as if they are recording you?": [
    "SupportMatch",
    "Chat Groups",
    "CompareNotes",
    "Chyme",
  ],
  "Have you been falsely accused of shoplifting, then still treated like a criminal after you have proven you did not steal anything?": [
    "CompareNotes",
    "SupportMatch",
    "Chat Groups",
    "Chyme",
  ],
  "Do you notice strange flashes of light wherever you go? or at home/work?": [
    "CompareNotes",
    "SupportMatch",
    "Chat Groups",
    "Chyme",
    "LightHouse",
  ],
  "Does everyone around you seem to be keeping some sort of a secret?": [
    "SupportMatch",
    "Chat Groups",
    "Directory",
    "Chyme",
  ],
  "Do weirdos offer you rides/solicit you for prostitution when you are just trying to walk down the street? even during the day?": [
    "TrustTransport",
    "SupportMatch",
    "Chat Groups",
    "Chyme",
  ],
  "Do you get strange phone calls/texts from numbers you don't know a lot?": [
    "Chat Groups",
    "CompareNotes",
    "SupportMatch",
    "Chyme",
  ],
  "Do your pets seem to sense that something is off/someone you don't know is near?": [
    "SupportMatch",
    "CompareNotes",
    "LightHouse",
    "Chyme",
    "Chat Groups",
  ],
  "Do people seem like they are only pretending to be your friend/partner?": [
    "SupportMatch",
    "Chat Groups",
    "Directory",
  ],
  "Do store/hotel clerks suddenly act strangely when you give your name/id?": [
    "CompareNotes",
    "SupportMatch",
  ],
  "If you go to walmart/target do the theft detectors beep once quickly when you walk in?": [
    "CompareNotes",
    "SupportMatch",
    "SocketRelay",
  ],
  "Do people like to waste your time, sending you on wild goose chases to accomplish simple tasks/appointments?": [
    "Workforce Recruiter",
    "SocketRelay",
    "Directory",
  ],
  "Anytime you have to call a customer service line you are put on hold forever only to be hung up on and start the cycle again and again?": [
    "Workforce Recruiter",
    "Directory",
  ],
  "Do you have an unusually large amount of car problems?": [
    "MechanicMatch",
  ],
  "Do items disappear, then reappear weeks/months later?": [
    "SocketRelay",
    "Lighthouse",
  ],
  "Do people you've never introduced yourself to somehow already know your name?": [
    "CompareNotes",
    "SupportMatch",
    "Chat Groups",
    "Chyme",
  ],
  "Do you experience unexplained bruising/cuts/pain/injuries?": [
    "CompareNotes",
    "GentlePulse",
  ],
}

const problems = Object.keys(problemSolutions)

export default function LookMaIFixedIt() {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-[6px] border-foreground bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="p-2 border-[3px] border-foreground bg-card hover:bg-accent transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-accent transform rotate-3 -z-10 scale-110" />
              <div className="bg-foreground text-background px-6 py-3 md:px-10 md:py-5 border-[4px] border-foreground relative">
                <h1 className="font-[var(--font-bangers)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide">
                  LOOK MA, I FIXED IT!
                </h1>
              </div>
            </div>
          </div>
          <p className="font-[var(--font-inter)] text-muted-foreground max-w-3xl text-sm sm:text-base md:text-lg">
            Every problem you've experienced has a solution. Click on any problem to see how our platform addresses it.
            Each solution is a real tool in our super app, built specifically for survivors.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <ProblemCard
              key={index}
              problem={problem}
              solutions={problemSolutions[problem]}
              isSelected={selectedProblem === problem}
              onSelect={() => setSelectedProblem(selectedProblem === problem ? null : problem)}
              onSolutionHover={setHoveredSolution}
              hoveredSolution={hoveredSolution}
              imagePlaceholder={`/images/problems/problem-${index + 1}.png`}
            />
          ))}
        </div>

        {selectedProblem && (
          <SolutionConnector
            problem={selectedProblem}
            solutions={problemSolutions[selectedProblem]}
            onClose={() => setSelectedProblem(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}


