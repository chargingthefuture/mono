import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { UserCheck, Building2, ArrowRight, MessageCircle, Wrench, Mail, Search, HeartPulse, Radio, Car, Briefcase, Activity} from "lucide-react";

const services = [
  {
    title: "Chat Groups",
    description: "Connect with others experiencing similar situations in reall time chats via Signal.",
    icon: MessageCircle,
    href: "/apps/chatgroups",
    testId: "card-service-chatgroups",
  },
  {
    title: "Directory",
    description: "Build genuine professional connections away from manipulation.",
    icon: Building2,
    href: "/apps/directory",
    testId: "card-service-directory",
  },
  {
    title: "LightHouse",
    description: "Find safe accommodations and escape dangerous living situations.",
    icon: Building2,
    href: "/apps/lighthouse",
    testId: "card-service-lighthouse",
  },
  {
    title: "SocketRelay",
    description: "Get items through our community when stores are problematic.",
    icon: UserCheck,
    href: "/apps/socketrelay",
    testId: "card-service-socketrelay",
  },
  {
    title: "SupportMatch",
    description: "Find accountability partners who understand.",
    icon: UserCheck,
    href: "/apps/supportmatch",
    testId: "card-service-supportmatch",
  },
  {
    title: "MechanicMatch",
    description: "Connect with trusted mechanics when your car breaks down or is tampered with",
    icon: Wrench,
    href: "/apps/mechanicmatch",
    testId: "card-service-mechanicmatch",
  },
  {
    title: "LostMail",
    description: "Track mail tampering, loss, and delays with detailed incident reports.",
    icon: Mail,
    href: "/apps/lostmail",
    testId: "card-service-lostmail",
  },
  {
    title: "CompareNotes",
    description: "Document patterns, incidents, and share evidence with the community.",
    icon: Search,
    href: "/apps/comparenotes",
    testId: "card-service-research",
  },
  {
    title: "GentlePulse",
    description: "Manage stress, anxiety, and wellness when dealing with constant harassment.",
    icon: HeartPulse,
    href: "/apps/gentlepulse",
    testId: "card-service-gentlepulse",
  },
  {
    title: "Chyme",
    description: "Social audio conversations away from from perps.",
    icon: Radio,
    href: "/apps/chyme",
    testId: "card-service-chyme",
  },
  {
    title: "TrustTransport",
    description: "Get safe rides to avoid public harassment and surveillance.",
    icon: Car,
    href: "/apps/trusttransport",
    testId: "card-service-trusttransport",
  },
  {
    title: "Workforce Recruiter",
    description: "Review the collective skillset of the TI Skills Economy and find or expand your career amongst TIs.",
    icon: Briefcase,
    href: "/apps/workforce-recruiter",
    testId: "card-service-workforce-recruiter",
  },
];

export default function Services() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold mb-2">
          Available Services
        </h1>
        <p className="text-muted-foreground">
          Explore our support services designed specifically for survivors
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.title} className="hover-elevate" data-testid={service.testId}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
              <Link href={service.href}>
                <Button variant="outline" className="w-full" data-testid={`button-access-${service.title.toLowerCase().replace(' ', '-')}`}>
                  Access Service
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
