/**
 * MechanicMatch Admin Profile List Component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/pagination-controls";
import { ShieldQuestion, PencilLine, Trash2, UserPlus } from "lucide-react";
import type { MechanicmatchProfile } from "@shared/schema";

interface MechanicMatchAdminProfileListProps {
  profiles: MechanicmatchProfile[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: "all" | "mechanic" | "owner";
  onRoleFilterChange: (value: "all" | "mechanic" | "owner") => void;
  claimedFilter: "all" | "claimed" | "unclaimed";
  onClaimedFilterChange: (value: "all" | "claimed" | "unclaimed") => void;
  page: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (profile: MechanicmatchProfile) => void;
  onAssign: (profile: MechanicmatchProfile) => void;
  onDelete: (profile: MechanicmatchProfile) => void;
}

export function MechanicMatchAdminProfileList({
  profiles,
  isLoading,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  claimedFilter,
  onClaimedFilterChange,
  page,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onAssign,
  onDelete,
}: MechanicMatchAdminProfileListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>Profile Directory</CardTitle>
          <CardDescription>Track claimed and unclaimed listings.</CardDescription>
        </div>
        <div className="grid gap-3 md:grid-cols-3 w-full md:w-auto">
          <Input
            placeholder="Search profiles"
            value={searchTerm}
            onChange={(event) => {
              onSearchChange(event.target.value);
              onPageChange(0);
            }}
            data-testid="input-admin-search"
          />
          <Select
            value={roleFilter}
            onValueChange={(value: "all" | "mechanic" | "owner") => {
              onRoleFilterChange(value);
              onPageChange(0);
            }}
          >
            <SelectTrigger data-testid="select-role-filter">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="mechanic">Mechanics</SelectItem>
              <SelectItem value="owner">Car Owners</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={claimedFilter}
            onValueChange={(value: "all" | "claimed" | "unclaimed") => {
              onClaimedFilterChange(value);
              onPageChange(0);
            }}
          >
            <SelectTrigger data-testid="select-claimed-filter">
              <SelectValue placeholder="Claimed status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All profiles</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="unclaimed">Unclaimed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ShieldQuestion className="w-10 h-10 text-muted-foreground/60 mx-auto" />
            <p className="text-muted-foreground">No profiles match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-4 border rounded-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between" data-testid={`profile-row-${profile.id}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{profile.userId ? "Claimed Profile" : "Unclaimed Profile"}</h3>
                    <Badge variant={profile.isClaimed ? "default" : "secondary"}>
                      {profile.isClaimed ? "Claimed" : "Unclaimed"}
                    </Badge>
                  </div>
                  {(() => {
                    const firstName = (profile as any).firstName?.trim();
                    return firstName ? (
                      <div className="text-base font-medium">{firstName}</div>
                    ) : null;
                  })()}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {profile.city && <span>{profile.city}</span>}
                    {profile.state && <span>{profile.state}</span>}
                    {profile.country && <span>{profile.country}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide">
                    {profile.isMechanic && <Badge variant="outline">Mechanic</Badge>}
                    {profile.isCarOwner && <Badge variant="outline">Car Owner</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!profile.isClaimed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssign(profile)}
                      data-testid={`button-assign-${profile.id}`}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign to User
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(profile)}
                    data-testid={`button-edit-${profile.id}`}
                  >
                    <PencilLine className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {!profile.isClaimed && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(profile)}
                      data-testid={`button-delete-${profile.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <PaginationControls
          currentPage={page}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
}

