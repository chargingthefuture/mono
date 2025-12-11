import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Utility function to extract the mini-app homepage URL from any path
 * Returns null if not a mini-app path or if already on homepage
 */
function getMiniAppHomepage(path: string): string | null {
  // Match paths like /apps/{miniapp} or /apps/{miniapp}/...
  const match = path.match(/^\/apps\/([^/]+)/);
  if (!match) {
    return null; // Not a mini-app path
  }

  const miniAppName = match[1];
  const homepage = `/apps/${miniAppName}`;

  // If we're already on the homepage, return null (don't show back button)
  if (path === homepage) {
    return null;
  }

  return homepage;
}

/**
 * MiniAppBackButton - Shows a back button to return to the mini-app homepage
 * Only displays when on a sub-page of a mini-app (not on the homepage itself)
 */
export function MiniAppBackButton() {
  const [location, setLocation] = useLocation();
  const homepage = getMiniAppHomepage(location);

  // Don't render if we're on the homepage or not in a mini-app
  if (!homepage) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLocation(homepage)}
      data-testid="button-back-to-miniapp-home"
      aria-label="Back to mini-app homepage"
      className="mb-4"
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
}

