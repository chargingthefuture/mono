import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DirectoryProfile } from "@shared/schema";
import { ExternalLink, Copy, Check } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { useToast } from "@/hooks/use-toast";
import { useExternalLink } from "@/hooks/useExternalLink";

export default function PublicDirectoryProfile() {
  const { toast } = useToast();
  const { openExternal, ExternalLinkDialog } = useExternalLink();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
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
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = useQuery<DirectoryProfile | null>({
    queryKey: ["/api/directory/public", id],
    queryFn: async () => {
      const res = await fetch(`/api/directory/public/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Profile not found or not public</p>
        </div>
      </div>
    );
  }

  const userIsVerified = (profile as any).userIsVerified || false;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Directory Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Public profile</p>
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Public Directory Link</label>
          <p className="text-sm text-muted-foreground">Return to the public directory to view all public profiles.</p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg sm:text-xl">
                {(profile as any).displayName || 
                 ((profile as any).firstName && (profile as any).lastName ? `${(profile as any).firstName} ${(profile as any).lastName}` : null) ||
                 (profile as any).firstName ||
                 (profile as any).lastName ||
                 'Directory Profile'}
              </CardTitle>
              <VerifiedBadge isVerified={userIsVerified} testId="badge-verified-public" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-base">{profile.description}</p>
          </div>

          {profile.skills?.length ? (
            <div>
              <p className="text-sm text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.skills.map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          {profile.sectors?.length ? (
            <div>
              <p className="text-sm text-muted-foreground">Sectors</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.sectors.map(s => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          {profile.jobTitles?.length ? (
            <div>
              <p className="text-sm text-muted-foreground">Job Titles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.jobTitles.map(jt => (
                  <Badge key={jt} variant="secondary">{jt}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Intentionally hide Signal link on public profile */}
            <div />
            {profile.quoraUrl ? (
              <a className="text-primary inline-flex items-center gap-2" href={profile.quoraUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> Quora profile
              </a>
            ) : <div />}
            <div className="text-sm text-muted-foreground">
              {profile.city || profile.state || profile.country ? (
                <span>{[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <ExternalLinkDialog />
    </div>
  );
}
