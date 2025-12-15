import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Industry = "ecommerce" | "b2b" | "social" | "custom";

const INDUSTRY_BENCHMARKS: Record<Industry, { label: string; min: number; max: number }> = {
  ecommerce: { label: "E-commerce", min: 1, max: 5 },
  b2b: { label: "B2B", min: 2, max: 10 },
  social: { label: "Social media marketing", min: 1, max: 3 },
  custom: { label: "Custom / niche", min: 0, max: 0 },
};

export default function ConversionCalculator() {
  const [followers, setFollowers] = useState<string>("");
  const [customers, setCustomers] = useState<string>("");
  const [industry, setIndustry] = useState<Industry>("ecommerce");
  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const parseNumber = (value: string) => {
    const n = Number(value.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };

  const handleCalculate = () => {
    const followersNum = parseNumber(followers);
    const customersNum = parseNumber(customers);

    if (!Number.isFinite(followersNum) || followersNum <= 0) {
      setConversionRate(null);
      return;
    }

    if (!Number.isFinite(customersNum) || customersNum < 0) {
      setConversionRate(null);
      return;
    }

    const rate = (customersNum / followersNum) * 100;
    setConversionRate(rate);
  };

  const benchmark = INDUSTRY_BENCHMARKS[industry];

  const getPerformanceMessage = () => {
    if (conversionRate == null || !benchmark) return "";

    if (industry === "custom") {
      return "For custom or niche audiences, compare against your own past performance over time.";
    }

    if (conversionRate < benchmark.min) {
      return `Your conversion rate is below the typical ${benchmark.label.toLowerCase()} range of ${benchmark.min}%–${benchmark.max}%. Focus on tightening your offer, messaging, and audience fit.`;
    }

    if (conversionRate > benchmark.max) {
      return `Your conversion rate is above the typical ${benchmark.label.toLowerCase()} range of ${benchmark.min}%–${benchmark.max}%. That's strong performance—consider whether you can scale reach while maintaining quality.`;
    }

    return `Your conversion rate sits within the typical ${benchmark.label.toLowerCase()} range of ${benchmark.min}%–${benchmark.max}%. You're on track—keep testing and iterating to move toward the upper end of the range.`;
  };

  const exampleFollowers = 269;
  const exampleCustomers = 20;
  const exampleRate = (exampleCustomers / exampleFollowers) * 100;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold">Conversion Calculator</h1>
        <p className="text-muted-foreground">
          Admin-only tool to quickly check whether your follower counts are converting into customers at a healthy rate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Follower → Customer Conversion</CardTitle>
          <CardDescription>
            Enter your current followers and customers to see your conversion rate and how it compares to common
            benchmarks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="followers">Total followers</Label>
              <Input
                id="followers"
                type="text"
                inputMode="numeric"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customers">Number of customers</Label>
              <Input
                id="customers"
                type="text"
                inputMode="numeric"
                value={customers}
                onChange={(e) => setCustomers(e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Context / industry</Label>
            <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ecommerce">E-commerce (typical 1%–5%)</SelectItem>
                <SelectItem value="b2b">B2B (typical 2%–10%)</SelectItem>
                <SelectItem value="social">Social media marketing (typical 1%–3%)</SelectItem>
                <SelectItem value="custom">Custom / niche (no fixed benchmark)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" className="w-full sm:w-auto" onClick={handleCalculate}>
            Calculate conversion rate
          </Button>

          {conversionRate != null && (
            <div className="space-y-2 rounded-md border bg-muted/40 p-4">
              <div className="text-sm font-medium text-muted-foreground">Your conversion rate</div>
              <div className="text-2xl font-semibold">
                {conversionRate.toFixed(2)}
                <span className="text-base font-normal text-muted-foreground ml-1">%</span>
              </div>
              {industry !== "custom" && (
                <div className="text-sm text-muted-foreground">
                  Typical {benchmark.label.toLowerCase()} range: {benchmark.min}%–{benchmark.max}%.
                </div>
              )}
              <p className="text-sm text-muted-foreground">{getPerformanceMessage()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example: 20 customers from 269 followers</CardTitle>
          <CardDescription>
            This mirrors the example where 20 customers came from 269 followers and shows how the calculator interprets
            it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Using the formula{" "}
            <span className="font-medium">Conversion Rate = (Number of Customers / Total Followers) × 100</span>:
          </p>
          <p>
            <span className="font-medium">Number of customers:</span> {exampleCustomers}
            <br />
            <span className="font-medium">Total followers:</span> {exampleFollowers}
            <br />
            <span className="font-medium">Conversion rate:</span> ({exampleCustomers} / {exampleFollowers}) × 100 ≈{" "}
            {exampleRate.toFixed(2)}%
          </p>
          <p>
            In many e-commerce or social contexts, a conversion rate around {exampleRate.toFixed(2)}% is{" "}
            <span className="font-medium">strong performance</span>, often above typical averages. The key is to track
            this over time and watch how changes to your content, offers, and audience targeting impact this number.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


