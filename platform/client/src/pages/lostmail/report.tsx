import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLostmailIncidentSchema } from "@shared/schema";
import { z } from "zod";
import { useLocation } from "wouter";
import { Send, AlertCircle } from "lucide-react";
import type { LostmailIncident } from "@shared/schema";

const reportFormSchema = insertLostmailIncidentSchema.omit({
  status: true,
  assignedTo: true,
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export default function LostMailReport() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reporterName: "",
      reporterEmail: "",
      reporterPhone: "",
      incidentType: "lost",
      carrier: "",
      trackingNumber: "",
      expectedDeliveryDate: "",
      noticedDate: "",
      description: "",
      photos: null,
      severity: "medium",
      consent: false,
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    
    try {
      const incident = await apiRequest<LostmailIncident>("POST", "/api/lostmail/incidents", {
        ...data,
        photos: null,
        expectedDeliveryDate: new Date(data.expectedDeliveryDate as string).toISOString(),
        noticedDate: data.noticedDate ? new Date(data.noticedDate as string).toISOString() : null,
      });
      
      toast({
        title: "Report Submitted",
        description: `Your incident report has been submitted. Incident ID: ${incident.id}`,
      });
      
      // Redirect to confirmation page
      setLocation(`/apps/lostmail/incident/${incident.id}`);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Report Mail Incident</h1>
        <p className="text-muted-foreground">
          Report lost, damaged, tampered, or delayed mail
        </p>
      </div>

      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          This form does not auto-save. If you navigate away from this page without clicking the "Submit Report" button, your data will be lost.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Reporter Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Reporter Information</h3>
                
                <FormField
                  control={form.control}
                  name="reporterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" data-testid="input-reporter-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} placeholder="your@email.com" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reporterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(555) 123-4567" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Incident Details */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Incident Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="incidentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Incident Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-incident-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="tampered">Tampered</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-severity">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1234567890" data-testid="input-tracking" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mail Carrier</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="USPS, FedEx, UPS, etc." data-testid="input-carrier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expectedDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Delivery Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-expected-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="noticedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Noticed</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-noticed-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe the incident in detail..."
                          rows={6}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Consent */}
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-consent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I consent to storing this information *</FormLabel>
                      <FormDescription>
                        Required to process your report
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.watch("consent")}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
