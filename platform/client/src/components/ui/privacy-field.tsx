import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyFieldProps {
  value: string;
  type?: "email" | "phone" | "text";
  className?: string;
  testId?: string;
}

export function PrivacyField({ 
  value, 
  type = "text", 
  className = "", 
  testId 
}: PrivacyFieldProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const getMaskedValue = () => {
    if (!value) return "";
    
    if (type === "email") {
      const [localPart, domain] = value.split("@");
      if (!domain) return "•••••••••";
      const maskedLocal = localPart.substring(0, 2) + "•••";
      const maskedDomain = "•••" + domain.substring(domain.lastIndexOf("."));
      return `${maskedLocal}@${maskedDomain}`;
    }
    
    if (type === "phone") {
      if (value.length <= 4) return "•••-••••";
      return "•••-•••-" + value.slice(-4);
    }
    
    // Generic masking for other text
    if (value.length <= 4) return "••••••";
    return value.substring(0, 2) + "•••" + value.substring(value.length - 2);
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className={`select-none ${isRevealed ? "" : "font-mono"}`}
        data-testid={testId}
      >
        {isRevealed ? value : getMaskedValue()}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover-elevate"
        onClick={() => setIsRevealed(!isRevealed)}
        data-testid={`${testId}-toggle`}
        type="button"
      >
        {isRevealed ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
