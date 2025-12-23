import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GentlePulseDesktopNav } from "@/components/gentlepulse/desktop-nav";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Eye, Type, Bell } from "lucide-react";

const SETTINGS_STORAGE_KEY = "gentlepulse_settings";

interface GentlePulseSettings {
  moodCheckEnabled: boolean;
  highContrast: boolean;
  fontSize: "normal" | "large" | "extra-large";
  dyslexiaFont: boolean;
}

export default function GentlePulseSettings() {
  const [settings, setSettings] = useState<GentlePulseSettings>({
    moodCheckEnabled: true,
    highContrast: false,
    fontSize: "normal",
    dyslexiaFont: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const loadedSettings = JSON.parse(saved);
        setSettings(loadedSettings);
        
        // Apply settings immediately on mount
        if (loadedSettings.highContrast) {
          document.documentElement.classList.add("high-contrast");
        }
        if (loadedSettings.dyslexiaFont) {
          document.documentElement.classList.add("dyslexia-font");
        }
        if (loadedSettings.fontSize) {
          document.documentElement.className = document.documentElement.className
            .replace(/font-size-\w+/g, "");
          document.documentElement.classList.add(`font-size-${loadedSettings.fontSize}`);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const updateSetting = <K extends keyof GentlePulseSettings>(
    key: K,
    value: GentlePulseSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));

    // Apply settings immediately
    if (key === "highContrast") {
      document.documentElement.classList.toggle("high-contrast", value as boolean);
    }
    if (key === "dyslexiaFont") {
      document.documentElement.classList.toggle("dyslexia-font", value as boolean);
    }
    if (key === "fontSize") {
      document.documentElement.className = document.documentElement.className
        .replace(/font-size-\w+/g, "");
      document.documentElement.classList.add(`font-size-${value}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience
        </p>
      </div>

      <GentlePulseDesktopNav />

      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                High Contrast Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting("highContrast", checked)}
              data-testid="switch-high-contrast"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Font Size
            </Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: any) => updateSetting("fontSize", value)}
            >
              <SelectTrigger id="font-size" data-testid="select-font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
              <p className="text-sm text-muted-foreground">
                Use OpenDyslexic font for easier reading
              </p>
            </div>
            <Switch
              id="dyslexia-font"
              checked={settings.dyslexiaFont}
              onCheckedChange={(checked) => updateSetting("dyslexiaFont", checked)}
              data-testid="switch-dyslexia-font"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mood-check">Weekly Mood Check</Label>
              <p className="text-sm text-muted-foreground">
                Receive optional weekly mood check prompts
              </p>
            </div>
            <Switch
              id="mood-check"
              checked={settings.moodCheckEnabled}
              onCheckedChange={(checked) => updateSetting("moodCheckEnabled", checked)}
              data-testid="switch-mood-check"
            />
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Your Privacy Matters:</strong> All data collected is anonymous and aggregated.
              We do not collect personal information, track individuals, or sell data to third parties.
              Your use of GentlePulse is completely private.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
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
          <Link href="/apps/gentlepulse/announcements">
            <Button variant="outline" className="w-full text-xs sm:text-sm" data-testid="button-view-announcements">
              View Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
