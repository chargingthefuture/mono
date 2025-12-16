import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";

/**
 * Determines if a URL is internal (same origin) or external
 */
function isInternalLink(url: string): boolean {
  try {
    // Relative paths are always internal
    if (url.startsWith("/")) {
      return true;
    }

    // For absolute URLs, compare origins
    const urlObj = new URL(url, window.location.href);
    return urlObj.origin === window.location.origin;
  } catch {
    // If URL parsing fails, treat as external for safety
    return false;
  }
}

export function useExternalLink() {
  const [url, setUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isInternal = useMemo(() => {
    return url ? isInternalLink(url) : false;
  }, [url]);

  const openExternal = (linkUrl: string) => {
    // Show dialog for all links (both internal and external) for consistency
    setUrl(linkUrl);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      setIsOpen(false);
      setUrl(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setUrl(null);
  };

  const handleCopy = async () => {
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
      } catch (err) {
        // Fallback for older browsers
        console.error("Failed to copy URL:", err);
      }
    }
  };

  const ExternalLinkDialog = () => {
    const [copied, setCopied] = useState(false);

    const handleCopyClick = async () => {
      await handleCopy();
      // Only show "Copied" state if the URL was set and clipboard write didn't throw
      if (url) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isInternal ? "Open Link in New Window" : "Open External Link"}
            </DialogTitle>
            <DialogDescription>
              {isInternal
                ? "You are about to open a link in a new window. This will take you to another page within this application."
                : "You are about to open a link in a new window. This will take you to an external site."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground break-all">{url}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleCopyClick}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>
            <Button onClick={handleConfirm}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return { openExternal, ExternalLinkDialog };
}