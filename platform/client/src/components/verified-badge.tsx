import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShieldCheck, Shield, Info } from "lucide-react";
import { useState } from "react";

interface VerifiedBadgeProps {
  isVerified: boolean;
  className?: string;
  testId?: string;
}

const VERIFICATION_EXPLANATION = "A Verified badge means that the community believes this member is likely a TI. An Unverified badge simply means the community has not done verification yet, but will. Non-TIs or perps are not permitted on the platform. And will be removed upon immediate discovery. All community members require verification. The length of time of verifying community members varies. Please use your best judgement at all times. The platform endorses no one. This badge can aid in determining who to interact with.";

export function VerifiedBadge({ isVerified, className = "", testId }: VerifiedBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      {isVerified ? (
        <Badge variant="secondary" className={`gap-1 ${className}`} data-testid={testId}>
          <ShieldCheck className="w-3 h-3" /> Verified
        </Badge>
      ) : (
        <Badge variant="outline" className={`gap-1 ${className}`} data-testid={testId}>
          <Shield className="w-3 h-3" /> Unverified
        </Badge>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
            aria-label="Learn more about verification badges"
            data-testid={testId ? `${testId}-info` : "verified-badge-info"}
          >
            <Info className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 sm:w-96" side="right" align="start">
          <p className="text-sm leading-relaxed">{VERIFICATION_EXPLANATION}</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

