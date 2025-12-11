import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Clock, X, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { cn, formatCurrency } from "@/lib/utils";
import { useExternalLink } from "@/hooks/useExternalLink";

interface PaymentStatus {
  isDelinquent: boolean;
  missingMonths: string[];
  nextBillingDate: string | null;
  amountOwed: string;
  gracePeriodEnds?: string;
}

interface PaymentReminderBannerProps {
  className?: string;
}

export function PaymentReminderBanner({ className }: PaymentReminderBannerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { openExternal, ExternalLinkDialog } = useExternalLink();

  const { data: paymentStatus, isLoading } = useQuery<PaymentStatus>({
    queryKey: ["/api/payments/status"],
  });

  // Don't show if not delinquent, loading, or dismissed
  if (isLoading || !paymentStatus?.isDelinquent || isDismissed) {
    return null;
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const missingMonthText = paymentStatus.missingMonths.length === 1
    ? formatMonth(paymentStatus.missingMonths[0])
    : `${paymentStatus.missingMonths.length} months`;

  if (isMinimized) {
    return (
      <Card className={cn("border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/30", className)}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
            <Clock className="w-4 h-4" />
            <span>Payment not received for {missingMonthText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-7 text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
              data-testid="button-expand-payment-banner"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-7 text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
              data-testid="button-dismiss-payment-banner"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/30", className)} data-testid="payment-reminder-banner">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5 text-amber-700 dark:text-amber-200" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                Payment not received for {missingMonthText}. Need help updating payment or changing plan?
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Amount: {formatCurrency(paymentStatus.amountOwed)}</span>
                </div>
                {paymentStatus.nextBillingDate && (
                  <div>
                    Next billing: {new Date(paymentStatus.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
                {paymentStatus.gracePeriodEnds && (
                  <div>
                    Grace period ends: {new Date(paymentStatus.gracePeriodEnds).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-7 text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
              data-testid="button-minimize-payment-banner"
              aria-label="Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-7 text-amber-800 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
              data-testid="button-dismiss-payment-banner"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/payments">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800/50"
              data-testid="button-update-payment"
            >
              Make payment
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800/50"
            onClick={() => openExternal("https://signal.group/#CjQKILHj7074l2Kl-oYy0qGSFdydXbtu0Pf66Z_88K9IlSCtEhDDdqV_BFAW2qm2EiTGEaNs")}
            data-testid="button-get-help"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Get help
          </Button>
        </div>
      </div>
      <ExternalLinkDialog />
    </Card>
  );
}

