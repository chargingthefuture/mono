import { Shield, Heart, Lock, Copy, Check, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useExternalLink } from "@/hooks/useExternalLink";
import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Landing() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { user, isAuthenticated, isLoading, _clerk } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users away from landing page
  // Note: RootRoute in App.tsx handles most of this, but this is a safety net
  useEffect(() => {
    // If Clerk says user is signed in, redirect appropriately
    if (_clerk.isSignedIn) {
      // If DB user is loaded and needs approval, they'll see pending message
      // No redirect needed - RootRoute handles it
      // Otherwise, redirect to home dashboard (RootRoute will handle showing Home)
      setLocation("/");
    }
  }, [_clerk.isSignedIn, user, setLocation]);

  const bitcoinAddress = "bc1qqurdsmdwfg9uekvvwf29r3r7ufu3l2tenncdtd";
  const moneroAddress = "49V9nUSEjTPbqGzAEtvepMSHz5FvknBR3gYQFe8mhme5AF2VHoEoVBdcViZM1kFzMWUcpsS8w5oJeLd57pQRPUdjNhpawYr";
  const signalGroupUrl = "https://signal.group/#CjQKILHj7074l2Kl-oYy0qGSFdydXbtu0Pf66Z_88K9IlSCtEhDDdqV_BFAW2qm2EiTGEaNs";

  const copyAddress = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(`${type}-${address}`);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  // Don't render landing page if user is authenticated (redirect is in progress)
  if (_clerk.isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            {/* Content */}
            <div className="space-y-6 lg:space-y-8 w-full">
              <div className="space-y-3 lg:space-y-4 text-center pt-8 lg:pt-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  world's first psyop-free
                  <span className="block text-primary mt-1 lg:mt-2">TI economy</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  A platform designed specifically for survivors, offering essential 
                  services and support with dignity, privacy, and respect.
                </p>
              </div>

              <div className="grid gap-3 lg:gap-4 max-w-md mx-auto">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Approved Access Only</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your safety is our priority. Access is granted through manual approval by administrators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Private & Secure</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your information is protected with the highest security standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Support Services</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Access essential services including support matching, housing, and resources.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign-in box */}
              <Card className="w-full max-w-md shadow-2xl mx-auto">
                <CardContent className="p-6 sm:p-8 lg:p-10">
                  <div className="space-y-5 lg:space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-xl sm:text-2xl font-semibold">Access Platform</h2>
                      <p className="text-sm text-muted-foreground">
                        Sign in to access your secure account
                      </p>
                    </div>

                    <LoginForm />

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 lg:pt-4">
                      <Lock className="w-3 h-3" />
                      <span>Secure & Private</span>
                    </div>

                    <div className="pt-3 lg:pt-4 border-t">
                      <p className="text-xs text-center text-muted-foreground leading-relaxed">
                        Need access?{" "}
                        <button
                          onClick={() => openExternal(signalGroupUrl)}
                          className="text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
                          data-testid="link-signal-group"
                        >
                          Contact our support coordinator for secure access
                        </button>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donation Section for Non-Survivors */}
              <Card className="w-full max-w-md shadow-xl border-primary/20 mx-auto">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Support the Platform</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This community is exclusively for survivors. If you're not a survivor but want to help maintain and support this platform, you can donate using the addresses below.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    {/* Bitcoin */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Bitcoin</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
                          {bitcoinAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyAddress(bitcoinAddress, "bitcoin")}
                          className="flex-shrink-0"
                          data-testid="button-copy-bitcoin"
                        >
                          {copiedAddress === `bitcoin-${bitcoinAddress}` ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Monero */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Monero</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
                          {moneroAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyAddress(moneroAddress, "monero")}
                          className="flex-shrink-0"
                          data-testid="button-copy-monero"
                        >
                          {copiedAddress === `monero-${moneroAddress}` ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-center text-muted-foreground">
                      Donations help maintain infrastructure and keep services affordable for survivors.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ExternalLinkDialog />
    </div>
  );
}
