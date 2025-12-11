import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertChymeRoomSchema, type ChymeRoom } from "@shared/schema";
import { z } from "zod";
import { useRoute, useLocation } from "wouter";
import { MiniAppBackButton } from "@/components/mini-app-back-button";

const roomFormSchema = insertChymeRoomSchema.omit({ createdBy: true }).extend({
  isActive: z.boolean().optional(),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

export default function ChymeAdminRoomForm() {
  const { toast } = useToast();
  const [, paramsNew] = useRoute("/apps/chyme/admin/rooms/new");
  const [, paramsEdit] = useRoute("/apps/chyme/admin/rooms/:id/edit");
  const [, setLocation] = useLocation();
  const roomId = paramsEdit?.id;
  const isEditing = !!roomId && !paramsNew;

  const { data: room, isLoading: roomLoading } = useQuery<ChymeRoom>({
    queryKey: ['/api/chyme/rooms', roomId],
    enabled: isEditing && !!roomId,
  });

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: "",
      description: "",
      roomType: "private",
      maxParticipants: 50,
      isActive: true,
    },
  });

  // Update form when room data loads
  React.useEffect(() => {
    if (room) {
      form.reset({
        name: room.name,
        description: room.description || "",
        roomType: room.roomType as "private" | "public",
        maxParticipants: room.maxParticipants || 50,
        isActive: room.isActive,
      });
    }
  }, [room, form]);

  const createMutation = useMutation({
    mutationFn: (data: RoomFormData) =>
      apiRequest("POST", "/api/chyme/admin/rooms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms'] });
      toast({ title: "Room Created", description: "The audio room has been created successfully." });
      setLocation("/apps/chyme/admin");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create room", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RoomFormData) =>
      apiRequest("PUT", `/api/chyme/admin/rooms/${roomId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chyme/rooms', roomId] });
      toast({ title: "Room Updated", description: "The audio room has been updated successfully." });
      setLocation("/apps/chyme/admin");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update room", variant: "destructive" });
    },
  });

  const onSubmit = (data: RoomFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEditing && roomLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <MiniAppBackButton href="/apps/chyme/admin" />
      
      <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
        {isEditing ? "Edit Room" : "Create New Room"}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Room Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., General Discussion"
                        data-testid="input-room-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Brief description of the room..."
                        rows={3}
                        value={field.value || ""}
                        data-testid="textarea-room-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} data-testid="select-room-type">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Private: Authentication required, full participation. Public: Open listening, chat requires authentication.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Participants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={1}
                          max={100}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                          data-testid="input-max-participants"
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of participants (1-100). Leave empty for unlimited.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditing && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-room-active"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          When enabled, the room is visible and accessible to users.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-room"
                >
                  {isEditing ? "Update Room" : "Create Room"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/apps/chyme/admin")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

