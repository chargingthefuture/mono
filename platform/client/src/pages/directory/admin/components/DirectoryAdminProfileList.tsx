import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, ExternalLink } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { PaginationControls } from "@/components/pagination-controls";
import { useExternalLink } from "@/hooks/useExternalLink";
import type { DirectoryProfile, User } from "@shared/schema";

type DirectoryProfileWithUser = DirectoryProfile & {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  userIsVerified?: boolean;
};

interface DirectoryAdminProfileListProps {
  profiles: DirectoryProfileWithUser[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  total: number;
  users: User[];
  onEdit: (profile: DirectoryProfileWithUser) => void;
  onDelete: (profile: DirectoryProfile) => void;
  onAssign: (profileId: string, userId: string) => void;
  editingId: string | null;
  renderEditForm: (profile: DirectoryProfileWithUser) => React.ReactNode;
}

export function DirectoryAdminProfileList({
  profiles,
  isLoading,
  searchTerm,
  onSearchChange,
  page,
  onPageChange,
  limit,
  total,
  users,
  onEdit,
  onDelete,
  onAssign,
  editingId,
  renderEditForm,
}: DirectoryAdminProfileListProps) {
  const { openExternal, ExternalLinkDialog } = useExternalLink();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">
          Profiles
          {!isLoading && profiles.length > 0 && (
            <span className="ml-2 text-muted-foreground font-normal">({profiles.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="search-profiles">Search Profiles</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="search-profiles"
              type="text"
              placeholder="Search by description, name, city, state, or country..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(0);
              }}
              className="pl-10"
              data-testid="input-search-profiles"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground py-6 text-center">Loading…</div>
        ) : profiles.length === 0 ? (
          <div className="text-muted-foreground py-6 text-center">
            {searchTerm ? "No profiles match your search" : "No profiles"}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {profiles.map((p) => {
                if (editingId === p.id) {
                  return <div key={p.id}>{renderEditForm(p)}</div>;
                }

                const isVerified = (p as any).userIsVerified ?? (p.isVerified || false);
                const firstName = (p as any).firstName?.trim?.() || "";
                const lastName = (p as any).lastName?.trim?.() || "";
                const fullName = [firstName, lastName].filter(Boolean).join(" ") || (p as any).displayName || "";

                return (
                  <div key={p.id} className="rounded-md border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <VerifiedBadge isVerified={isVerified} testId={`badge-verified-${p.id}`} />
                        {!p.isClaimed && <Badge variant="outline">Unclaimed</Badge>}
                        {p.isPublic && (
                          <Badge variant="default" className="gap-1">
                            <ExternalLink className="w-3 h-3" /> Public
                          </Badge>
                        )}
                      </div>
                      {(fullName || firstName || lastName) && (
                        <div className="mt-1 space-y-0.5 text-sm">
                          <div className="font-medium">{fullName || "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            Full name: {fullName || "—"} • First name: {firstName || "—"} • Last name: {lastName || "—"}
                          </div>
                        </div>
                      )}
                      <div className="text-sm mt-1 truncate">{p.description}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.city || p.state || p.country ? [p.city, p.state, p.country].filter(Boolean).join(", ") : "—"}
                      </div>
                      {p.isPublic && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openExternal(`${window.location.origin}/apps/directory/public/${p.id}`)}
                            className="text-primary text-xs h-auto p-0"
                            data-testid={`button-view-public-link-${p.id}`}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Public Profile
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!p.isClaimed && (
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue=""
                          onChange={(e) => e.target.value && onAssign(p.id, e.target.value)}
                          data-testid={`select-assign-user-${p.id}`}
                        >
                          <option value="">Assign to user…</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "User"}
                            </option>
                          ))}
                        </select>
                      )}
                      <Button variant="outline" size="sm" onClick={() => onEdit(p)} data-testid={`button-edit-${p.id}`}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      {!p.isClaimed && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(p)}
                          data-testid={`button-delete-${p.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {total > limit && (
              <PaginationControls
                currentPage={page}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={onPageChange}
                className="mt-6"
              />
            )}
          </>
        )}
      </CardContent>
      <ExternalLinkDialog />
    </Card>
  );
}

