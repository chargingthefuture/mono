import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatGroup } from "@shared/schema";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Link } from "wouter";

export default function ChatGroupsAdmin() {
  const { toast } = useToast();
  const { data: groups = [], isLoading } = useQuery<ChatGroup[]>({
    queryKey: ["/api/chatgroups/admin"],
  });

  const [newName, setNewName] = useState("");
  const [newSignalUrl, setNewSignalUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDisplayOrder, setNewDisplayOrder] = useState<string>("0");
  const [newIsActive, setNewIsActive] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSignalUrl, setEditSignalUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState<string>("0");
  const [editIsActive, setEditIsActive] = useState(true);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: newName.trim(),
        signalUrl: newSignalUrl.trim(),
        description: newDescription.trim(),
        displayOrder: parseInt(newDisplayOrder) || 0,
        isActive: newIsActive,
      };
      return apiRequest("POST", "/api/chatgroups/admin", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/chatgroups/admin"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/chatgroups"] });
      setNewName("");
      setNewSignalUrl("");
      setNewDescription("");
      setNewDisplayOrder("0");
      setNewIsActive(true);
      toast({ title: "Created", description: "Chat group created successfully" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to create chat group", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/chatgroups/admin/${id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/chatgroups/admin"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/chatgroups"] });
      setEditingId(null);
      toast({ title: "Updated", description: "Chat group updated successfully" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to update chat group", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/chatgroups/admin/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/chatgroups/admin"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/chatgroups"] });
      toast({ title: "Deleted", description: "Chat group deleted successfully" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to delete chat group", variant: "destructive" });
    },
  });

  const startEdit = (group: ChatGroup) => {
    setEditingId(group.id);
    setEditName(group.name);
    setEditSignalUrl(group.signalUrl);
    setEditDescription(group.description);
    setEditDisplayOrder(group.displayOrder.toString());
    setEditIsActive(group.isActive);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSignalUrl("");
    setEditDescription("");
    setEditDisplayOrder("0");
    setEditIsActive(true);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      data: {
        name: editName.trim(),
        signalUrl: editSignalUrl.trim(),
        description: editDescription.trim(),
        displayOrder: parseInt(editDisplayOrder) || 0,
        isActive: editIsActive,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Chat Groups Administration</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Create and manage Signal.org chat groups</p>
      </div>

      {/* Create New Group */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Chat Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-name">Name <span className="text-red-600">*</span></Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., General Support"
              data-testid="input-new-group-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-url">Signal URL <span className="text-red-600">*</span></Label>
            <Input
              id="new-url"
              type="url"
              value={newSignalUrl}
              onChange={(e) => setNewSignalUrl(e.target.value)}
              placeholder="https://signal.group/#..."
              data-testid="input-new-group-url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-description">Description <span className="text-red-600">*</span></Label>
            <Textarea
              id="new-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Brief description of the group..."
              rows={3}
              data-testid="input-new-group-description"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="new-order">Display Order</Label>
              <Input
                id="new-order"
                type="number"
                value={newDisplayOrder}
                onChange={(e) => setNewDisplayOrder(e.target.value)}
                data-testid="input-new-group-order"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="new-active"
                checked={newIsActive}
                onCheckedChange={(checked) => setNewIsActive(checked === true)}
                data-testid="checkbox-new-group-active"
              />
              <Label htmlFor="new-active" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!newName.trim() || !newSignalUrl.trim() || !newDescription.trim() || createMutation.isPending}
            data-testid="button-create-group"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createMutation.isPending ? "Creating..." : "Create Group"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Chat Groups ({groups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No chat groups yet</div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="border rounded-lg p-4 space-y-3" data-testid={`card-group-${group.id}`}>
                  {editingId === group.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          data-testid={`input-edit-name-${group.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Signal URL</Label>
                        <Input
                          type="url"
                          value={editSignalUrl}
                          onChange={(e) => setEditSignalUrl(e.target.value)}
                          data-testid={`input-edit-url-${group.id}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          data-testid={`input-edit-description-${group.id}`}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={editDisplayOrder}
                            onChange={(e) => setEditDisplayOrder(e.target.value)}
                            data-testid={`input-edit-order-${group.id}`}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Checkbox
                            checked={editIsActive}
                            onCheckedChange={(checked) => setEditIsActive(checked === true)}
                            data-testid={`checkbox-edit-active-${group.id}`}
                          />
                          <Label className="cursor-pointer">Active</Label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdate}
                          disabled={!editName.trim() || !editSignalUrl.trim() || !editDescription.trim() || updateMutation.isPending}
                          size="sm"
                          data-testid={`button-save-edit-${group.id}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={updateMutation.isPending}
                          size="sm"
                          data-testid={`button-cancel-edit-${group.id}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{group.name}</h3>
                            {group.isActive ? (
                              <Badge variant="default" data-testid={`badge-active-${group.id}`}>Active</Badge>
                            ) : (
                              <Badge variant="secondary" data-testid={`badge-inactive-${group.id}`}>Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                          <div className="text-xs text-muted-foreground break-all">{group.signalUrl}</div>
                          <div className="text-xs text-muted-foreground mt-1">Order: {group.displayOrder}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(group)}
                            data-testid={`button-edit-${group.id}`}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(group.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${group.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create and manage announcements for ChatGroups.
          </p>
          <Link href="/apps/chatgroups/admin/announcements">
            <Button className="w-full" data-testid="button-manage-announcements">
              Manage Announcements
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

