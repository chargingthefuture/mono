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
import { ExternalLink } from "lucide-react";

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

  const ExternalLinkDialog = () => (
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
          <Button onClick={handleConfirm}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { openExternal, ExternalLinkDialog };
}