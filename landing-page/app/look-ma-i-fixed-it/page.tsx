"use client"

import { useState } from "react"
import { ProblemCard } from "@/components/problem-card"
import { SolutionConnector } from "@/components/solution-connector"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Problem-to-solution mapping
const problemSolutions: Record<string, string[]> = {
  "Do idiots constantly try to get close to you physically, while aiming their cell phones at you and/or staring at their cell phones while invading your personal space?": [
    "SupportMatch", // Accountability partners to document incidents
    "CompareNotes", // Document patterns and share with community
    "Chat Groups", // Connect with others experiencing similar
  ],
  "Do your co workers that you have always been friendly with, suddenly start acting strange towards you and distancing themselves from you?": [
    "SupportMatch", // Find supportive accountability partners
    "Chat Groups", // Connect with understanding community
    "Directory", // Find new professional connections
  ],
  "Do idiots sit parked in their cars outside your home all the time?": [
    "SupportMatch", // Document with accountability partner
    "CompareNotes", // Track patterns and share evidence
    "LightHouse", // Find safe alternative housing
  ],
  "Do morons constantly get in your way and block you from where you are going out in public?/cut you in line?/hold up the line?": [
    "SupportMatch", // Document incidents with partner
    "TrustTransport", // Avoid public spaces, use safe rides
    "CompareNotes", // Document patterns
  ],
  "Did all your neighbors suddenly move, have their houses quickly sold and construction work done on them, then quickly have 'new neighbors' (who don't really seem to live there move in)?": [
    "LightHouse", // Find safe alternative housing
    "SupportMatch", // Document with accountability partner
    "CompareNotes", // Share patterns with community
  ],
  "Have any new street lamps/antennas been installed around your home/work recently?": [
    "CompareNotes", // Document and research patterns
    "SupportMatch", // Share concerns with accountability partner
    "Chat Groups", // Connect with others tracking similar
  ],
  "Do drones hover around you /your home/work/all the time?": [
    "CompareNotes", // Document incidents and patterns
    "SupportMatch", // Accountability partner to verify
    "LightHouse", // Consider relocation if needed
  ],
  "Do you experience tinnitus/ringing in ears?": [
    "GentlePulse", // Meditation and wellness support
    "SupportMatch", // Emotional support partner
    "CompareNotes", // Research and document symptoms
  ],
  "Do police officers follow/harass you for no good reason?": [
    "SupportMatch", // Document with accountability partner
    "CompareNotes", // Track incidents and patterns
    "Chat Groups", // Connect with others experiencing similar
  ],
  "Do you get denied assistance by government agencies based on arbitrary 'rules' that don't fit your situation, but they only operate in 'black and white' so they claim that you must be denied anyway?": [
    "Workforce Recruiter", // Track job search and applications
    "CompareNotes", // Document denials and patterns
    "SupportMatch", // Get support navigating systems
  ],
  "Do your neighbors always seem to come outside when you are there, then go inside when you do?": [
    "SupportMatch", // Document patterns with partner
    "CompareNotes", // Track and share patterns
    "LightHouse", // Consider safe housing alternatives
  ],
  "Do different people seem to be coming and going from neighbors houses around you all the time?": [
    "CompareNotes", // Document suspicious activity
    "SupportMatch", // Share concerns with accountability partner
    "LightHouse", // Find safer housing
  ],
  "Do several of your neighbors have strange colored lights coming out their windows at night?": [
    "CompareNotes", // Document and research
    "SupportMatch", // Share with accountability partner
    "LightHouse", // Consider relocation
  ],
  "Do people you don't know stare at you strangely/treat you bad for no reason?": [
    "SupportMatch", // Find supportive community
    "Chat Groups", // Connect with understanding peers
    "Directory", // Build new positive connections
  ],
  "Are new people pushing hard for you to be their new 'friend/roommate/romantic partner?": [
    "SupportMatch", // Find genuine accountability partners
    "Chat Groups", // Connect with safe community
    "Directory", // Build authentic professional connections
  ],
  "Do people seem to know things about you that you have never told them before?": [
    "CompareNotes", // Document and research patterns
    "SupportMatch", // Share concerns with trusted partner
    "Chat Groups", // Connect with others experiencing similar
  ],
  "Do you hear strange clicking noises on your phone when you make phone calls?": [
    "CompareNotes", // Document phone issues
    "SupportMatch", // Share concerns with partner
    "Chat Groups", // Use Signal-based secure communication
  ],
  "Do people you don't know constantly try to talk to you/befriend you while you are out in public?": [
    "SupportMatch", // Find genuine connections
    "TrustTransport", // Avoid public spaces, use safe rides
    "Chat Groups", // Connect with verified community
  ],
  "Do strange things happen around you a lot? (people fighting/arguing in the streets/causing scenes that seem staged?": [
    "CompareNotes", // Document staged incidents
    "SupportMatch", // Share with accountability partner
    "TrustTransport", // Avoid problematic areas
  ],
  "Do you get denied jobs/housing for no good reason?": [
    "Workforce Recruiter", // Track job applications and denials
    "LightHouse", // Find safe housing alternatives
    "SupportMatch", // Get support navigating systems
  ],
  "Do you live close to a freemason lodge? Or know someone who is a freemason?": [
    "CompareNotes", // Research and document connections
    "SupportMatch", // Share concerns with partner
    "LightHouse", // Consider relocation if needed
  ],
  "Does trying to do simple things like fill out an online job application become an ordeal due to endless clicking that brings you nowhere? or website conveniently won't load when you try to submit applications or important documents?": [
    "Workforce Recruiter", // Track applications and technical issues
    "CompareNotes", // Document website problems
    "SupportMatch", // Get help navigating systems
  ],
  "Do doctors deny you proper care?/ghost you?/tell you you are fine when you know something is wrong?/not get back to you with test results, then claim to have never received them, or have 'no record' of them.": [
    "CompareNotes", // Document medical incidents
    "SupportMatch", // Get support navigating healthcare
    "GentlePulse", // Manage stress and wellness
  ],
  "Do you hear strange humming/buzzing noises/sound of a machine running around you a lot, but can't pinpoint exactly where it's coming from?": [
    "CompareNotes", // Document and research sounds
    "SupportMatch", // Share with accountability partner
    "GentlePulse", // Manage stress and anxiety
  ],
  "Does your mail get lost/tampered with a lot?": [
    "LostMail", // Track mail incidents
    "SupportMatch", // Document with accountability partner
    "CompareNotes", // Share patterns with community
  ],
  "Do you get tired more than you should?/has anyone recently told you that they tried to wake you up but couldn't? when you are not normally such a deep sleeper": [
    "GentlePulse", // Track mood and wellness
    "CompareNotes", // Document symptoms
    "SupportMatch", // Share concerns with partner
  ],
  "Do people try to bait you into doing drugs? drinking? committing illegal acts?": [
    "SupportMatch", // Find accountability partners
    "Chat Groups", // Connect with supportive community
    "GentlePulse", // Wellness and stress management
  ],
  "Do people ask you to return things for them at stores like home depot/walmart/target/etc. because they 'don't have an i.d.' or some bullshit like that.": [
    "SupportMatch", // Learn to recognize manipulation
    "CompareNotes", // Document suspicious requests
    "Chat Groups", // Share experiences with community
  ],
  "If you are a woman, do perverted guys you don't know or just met straight up ask you for sex?": [
    "SupportMatch", // Find safe accountability partners
    "Chat Groups", // Connect with supportive community
    "TrustTransport", // Safe transportation to avoid dangerous situations
  ],
  "If you are sitting in your car minding your own business do idiots come and park right by/next to you and sit there too? usually buried in their phone? even if you are parked in an isolated area?": [
    "SupportMatch", // Document incidents
    "CompareNotes", // Track patterns
    "TrustTransport", // Use safe ride services instead
  ],
  "Do idiots constantly shine their bright headlights/flashlights/dews on you?": [
    "SupportMatch", // Document with accountability partner
    "CompareNotes", // Track incidents
    "TrustTransport", // Avoid driving in problematic areas
  ],
  "Do you often pull up to an empty store, and then it suddenly becomes busy after you go in? even at non busy business hours?": [
    "CompareNotes", // Document suspicious patterns
    "SupportMatch", // Share with accountability partner
    "SocketRelay", // Get items delivered instead
  ],
  "Do weirdos try to get you to say bad things about other people? as if they are recording you?": [
    "SupportMatch", // Learn to recognize manipulation
    "Chat Groups", // Connect with understanding community
    "CompareNotes", // Document attempts
  ],
  "Have you been falsely accused of shoplifting, then still treated like a criminal after you have proven you did not steal anything?": [
    "CompareNotes", // Document false accusations
    "SupportMatch", // Get support and accountability
    "Chat Groups", // Share experiences
  ],
  "Do you notice strange flashes of light wherever you go? or at home/work?": [
    "CompareNotes", // Document and research
    "SupportMatch", // Share with accountability partner
    "LightHouse", // Consider relocation if needed
  ],
  "Does everyone around you seem to be keeping some sort of a secret?": [
    "SupportMatch", // Find genuine connections
    "Chat Groups", // Connect with transparent community
    "Directory", // Build authentic relationships
  ],
  "Do weirdos offer you rides/solicit you for prostitution when you are just trying to walk down the street? even during the day?": [
    "TrustTransport", // Use safe, verified transportation
    "SupportMatch", // Find accountability partners
    "Chat Groups", // Connect with safe community
  ],
  "Do you get strange phone calls/texts from numbers you don't know a lot?": [
    "Chat Groups", // Use Signal-based secure communication
    "CompareNotes", // Document suspicious contacts
    "SupportMatch", // Share concerns with partner
  ],
  "Do your pets seem to sense that something is off/someone you don't know is near?": [
    "SupportMatch", // Trust your instincts and partner's validation
    "CompareNotes", // Document pet behavior patterns
    "LightHouse", // Consider if environment is unsafe
  ],
  "Do you hear crinkling noises a lot? like plastic shopping bags/mylar blankets?": [
    "CompareNotes", // Document and research sounds
    "SupportMatch", // Share with accountability partner
    "GentlePulse", // Manage stress and anxiety
  ],
  "Do people seem like they are only pretending to be your friend/partner/ and you can't figure out why they would do that?": [
    "SupportMatch", // Find genuine accountability partners
    "Chat Groups", // Connect with authentic community
    "Directory", // Build real professional connections
  ],
  "Do store/hotel clerks suddenly act strangely when you give your name/id?": [
    "CompareNotes", // Document incidents
    "SupportMatch", // Share with accountability partner
    "Workforce Recruiter", // Track if related to job applications
  ],
  "If you go to walmart/target do the theft detectors beep once quickly when you walk in?": [
    "CompareNotes", // Document suspicious technology
    "SupportMatch", // Share with accountability partner
    "SocketRelay", // Get items through community instead
  ],
  "Does the dmv discriminate against you/make it extra hard to clear up clerical errors on THEIR PART.": [
    "CompareNotes", // Document discrimination
    "SupportMatch", // Get support navigating systems
    "Workforce Recruiter", // Track if affecting job search
  ],
  "Do people like to waste your time, sending you on wild goose chases to accomplish simple tasks/appointments?": [
    "SupportMatch", // Get help navigating systems
    "CompareNotes", // Document time-wasting patterns
    "Workforce Recruiter", // Track if related to job search
  ],
  "Anytime you have to call a government agency for something important are you put on hold forever only to be hung up on and start the cycle again and again until you give up?": [
    "SupportMatch", // Get support and persistence help
    "CompareNotes", // Document systemic barriers
    "Workforce Recruiter", // Track if related to benefits/applications
  ],
  "Do you have an unusually large amount of car problems?": [
    "MechanicMatch", // Find trusted mechanics
    "CompareNotes", // Document suspicious car issues
    "SupportMatch", // Get support and validation
  ],
  "Do items disappear, then reappear weeks/months later?": [
    "CompareNotes", // Document disappearing items
    "SupportMatch", // Share with accountability partner
    "SocketRelay", // Get items through community
  ],
  "Do people you've never introduced yourself to somehow already know your name?": [
    "CompareNotes", // Document incidents
    "SupportMatch", // Share concerns with partner
    "Chat Groups", // Connect with others experiencing similar
  ],
  "Do you experience unexplained bruising/cuts/pain/injuries?": [
    "CompareNotes", // Document injuries
    "GentlePulse", // Manage pain and stress
    "SupportMatch", // Get support and validation
  ],
}

const problems = Object.keys(problemSolutions)

export default function LookMaIFixedIt() {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
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
              imagePlaceholder={`/images/problems/problem-${index + 1}.jpg`}
            />
          ))}
        </div>

        {/* Solution Connector - Shows when problem is selected */}
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


