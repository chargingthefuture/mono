import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Calendar, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { MechanicmatchAvailability } from "@shared/schema";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const availabilityFormSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z
    .union([z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), z.literal("")])
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  endTime: z
    .union([z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), z.literal("")])
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  isAvailable: z.boolean().default(true),
});

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: availability = [], isLoading } = useQuery<MechanicmatchAvailability[]>({
    queryKey: ["/api/mechanicmatch/availability"],
  });

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      dayOfWeek: 0,
      startTime: "",
      endTime: "",
      isAvailable: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AvailabilityFormValues) =>
      apiRequest("POST", "/api/mechanicmatch/availability", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/availability"] });
      form.reset();
      toast({ title: "Success", description: "Availability added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add availability",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AvailabilityFormValues> }) =>
      apiRequest("PUT", `/api/mechanicmatch/availability/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/availability"] });
      setEditingId(null);
      form.reset();
      toast({ title: "Success", description: "Availability updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/mechanicmatch/availability/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanicmatch/availability"] });
      toast({ title: "Success", description: "Availability deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete availability",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AvailabilityFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: MechanicmatchAvailability) => {
    setEditingId(item.id);
    form.reset({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      isAvailable: item.isAvailable,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset();
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || `Day ${dayOfWeek}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/apps/mechanicmatch">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Manage Availability</h1>
          <p className="text-muted-foreground">
            Set your weekly availability schedule
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Availability" : "Add Availability"}</CardTitle>
          <CardDescription>
            {editingId ? "Update your availability schedule" : "Add a new availability slot"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-day">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-start-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-end-time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-available"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available on this day</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingId ? "Update" : "Add"} Availability
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Existing Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Your Availability Schedule</CardTitle>
          <CardDescription>Manage your weekly availability</CardDescription>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No availability set. Add your schedule above.
            </p>
          ) : (
            <div className="space-y-4">
              {availability.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`availability-item-${item.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.isAvailable ? "default" : "secondary"}>
                        {getDayLabel(item.dayOfWeek)}
                      </Badge>
                      {item.startTime && item.endTime ? (
                        <span className="text-sm text-muted-foreground">
                          {item.startTime} - {item.endTime}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {item.isAvailable ? "All day" : "Not available"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      data-testid={`button-edit-${item.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





