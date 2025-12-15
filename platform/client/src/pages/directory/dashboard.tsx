import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ExternalLink, Bell, Copy, Check, Search } from "lucide-react";
import type { DirectoryProfile } from "@shared/schema";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { VerifiedBadge } from "@/components/verified-badge";
import { useExternalLink } from "@/hooks/useExternalLink";
import { useToast } from "@/hooks/use-toast";
import { useFuzzySearch } from "@/hooks/useFuzzySearch";

export default function DirectoryDashboard() {
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const publicDirectoryUrl = `${window.location.origin}/apps/directory/public`;
  
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Public Directory link copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const { data: profile, isLoading: profileLoading } = useQuery<DirectoryProfile | null>({
    queryKey: ["/api/directory/profile"],
  });

  const { data: publicProfiles = [], isLoading: listLoading } = useQuery<any[]>({
    queryKey: ["/api/directory/list"],
    enabled: !!profile,
  });

  // Filter profiles using fuzzy search on firstName and lastName
  const profilesToSearch = (publicProfiles && publicProfiles.length > 0) ? publicProfiles : (profile ? [profile] : []);
  const filteredProfiles = useFuzzySearch(profilesToSearch, searchQuery, {
    searchFields: ['firstName', 'lastName'],
    threshold: 0.3,
  });

  if (profileLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome message when there's no profile
  if (!profile) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Welcome to Directory</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Connect and exchange skills with other survivors</p>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Public Directory</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
                {publicDirectoryUrl}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyUrl(publicDirectoryUrl)}
                className="flex-shrink-0"
                data-testid="button-copy-public-directory"
                aria-label="Copy public Directory link"
              >
                {copiedUrl === publicDirectoryUrl ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openExternal(publicDirectoryUrl)}
                className="flex-shrink-0"
                data-testid="button-open-public-directory"
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Open
              </Button>
            </div>
          </div>
        </div>

        <AnnouncementBanner 
          apiEndpoint="/api/directory/announcements"
          queryKey="/api/directory/announcements"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Get Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm sm:text-base">
              To use Directory, you'll need to create your profile first. This helps you connect with other survivors and share your skills.
            </p>
            <Link href="/apps/directory/profile">
              <Button className="w-full" data-testid="button-create-profile">
                Create Your Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <ExternalLinkDialog />
      </div>
    );
  }

  // Profile exists - show directory listing
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Directory</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Connect and exchange skills with other survivors</p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Public Directory</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs sm:text-sm bg-muted px-2 py-1.5 rounded break-all">
              {publicDirectoryUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyUrl(publicDirectoryUrl)}
              className="flex-shrink-0"
              data-testid="button-copy-public-directory"
              aria-label="Copy public Directory link"
            >
              {copiedUrl === publicDirectoryUrl ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openExternal(publicDirectoryUrl)}
              className="flex-shrink-0"
              data-testid="button-open-public-directory"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open
            </Button>
          </div>
        </div>
      </div>

      <AnnouncementBanner 
        apiEndpoint="/api/directory/announcements"
        queryKey="/api/directory/announcements"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl">Explore the Directory</CardTitle>
            <Link href="/apps/directory/profile">
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                Edit Profile
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by first name or last name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-directory"
            />
          </div>
          
          {listLoading ? (
            <div className="text-muted-foreground py-6 text-center">Loading…</div>
          ) : (
            (() => {
              if (!filteredProfiles || filteredProfiles.length === 0) {
                return (
                  <div className="text-muted-foreground py-6 text-center">
                    {searchQuery ? "No profiles found matching your search" : "No profiles yet"}
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProfiles.map((p: any) => {
                    const firstName = p.firstName?.trim?.() || "";
                    const lastName = p.lastName?.trim?.() || "";
                    const fullName = [firstName, lastName].filter(Boolean).join(" ") || p.displayName || "";
                    return (
                      <div key={p.id} className="rounded-md border p-3 flex flex-col gap-2">
                        <div className="font-medium truncate">
                          {fullName || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Full name: {fullName || "—"} • First name: {firstName || "—"} • Last name: {lastName || "—"}
                        </div>
                        <div className="flex items-center gap-2">
                          <VerifiedBadge isVerified={(p as any).userIsVerified || false} testId={`badge-verified-${p.id}`} />
                        </div>
                        <div className="text-sm">{p.description}</div>
                        <div className="flex flex-wrap gap-2">
                          {p.skills?.map((s: string) => (<Badge key={s} variant="outline">{s}</Badge>))}
                        </div>
                        {p.sectors && p.sectors.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {p.sectors.map((s: string) => (<Badge key={s} variant="outline">{s}</Badge>))}
                          </div>
                        )}
                        {p.jobTitles && p.jobTitles.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {p.jobTitles.map((jt: string) => (<Badge key={jt} variant="outline">{jt}</Badge>))}
                          </div>
                        )}
                        {p.signalUrl ? (
                          <div>
                            <Button variant="ghost" size="sm" onClick={() => openExternal(p.signalUrl)} className="justify-start px-0 text-primary">
                              <ExternalLink className="w-4 h-4 mr-2" /> Signal profile
                            </Button>
                          </div>
                        ) : null}
                        <div className="text-xs text-muted-foreground">
                          {[p.city, p.state, p.country].filter(Boolean).join(', ')}
                        </div>
                        <div>
                          <Button asChild variant="outline" size="sm" data-testid={`button-view-public-${p.id}`}>
                            <a href={`/apps/directory/public/${p.id}`}>View</a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>

      {/* Announcements Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              View platform updates and notifications
            </p>
            <Link href="/apps/directory/announcements">
              <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-announcements">
                View Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ExternalLinkDialog />
    </div>
  );
}

