import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GentlePulseDesktopNav } from "@/components/gentlepulse/desktop-nav";

export default function GentlePulseSupport() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">About GentlePulse</h1>
        <p className="text-muted-foreground">
          Information about the app
        </p>
      </div>

      <GentlePulseDesktopNav />

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>About GentlePulse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            GentlePulse is designed to provide accessible, trauma-informed meditation resources.
            All content is provided as-is for informational purposes.
          </p>
          <div>
            <h3 className="font-medium mb-2">Privacy</h3>
            <p className="text-sm text-muted-foreground">
              We respect your privacy. All data collected is anonymous and aggregated.
              We do not collect personal information, and your data is never sold or shared with third parties.
              Your use of this app is completely anonymous.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
