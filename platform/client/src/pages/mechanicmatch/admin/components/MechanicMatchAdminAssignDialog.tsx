/**
 * MechanicMatch Admin Assign Dialog Component
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";
import type { MechanicmatchProfile } from "@shared/schema";

interface MechanicMatchAdminAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MechanicmatchProfile | null;
  users: User[];
  onAssign: (profileId: string, userId: string) => void;
  isAssigning: boolean;
}

export function MechanicMatchAdminAssignDialog({
  open,
  onOpenChange,
  profile,
  users,
  onAssign,
  isAssigning,
}: MechanicMatchAdminAssignDialogProps) {
  const [assignUserId, setAssignUserId] = useState("");
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  const selectedUser = users.find((u) => u.id === assignUserId);

  const handleAssign = () => {
    if (profile && assignUserId) {
      onAssign(profile.id, assignUserId);
      setAssignUserId("");
      setUserSearchOpen(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAssignUserId("");
    setUserSearchOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Profile to User</DialogTitle>
          <DialogDescription>
            Select a user to claim this unclaimed profile. Once assigned, the user will own this profile.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between", !assignUserId && "text-muted-foreground")}
                data-testid="select-assign-user"
              >
                {selectedUser
                  ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() || selectedUser.email || "Unknown User"
                  : "Select user..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandEmpty>No user found.</CommandEmpty>
                <CommandList>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.firstName || ""} ${user.lastName || ""} ${user.email || ""}`}
                        onSelect={() => {
                          setAssignUserId(user.id);
                          setUserSearchOpen(false);
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", assignUserId === user.id ? "opacity-100" : "opacity-0")}
                        />
                        <div className="flex flex-col">
                          <span>
                            {user.firstName || ""} {user.lastName || ""}
                          </span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel-assign">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!assignUserId || isAssigning || !profile}
            onClick={handleAssign}
            data-testid="button-confirm-assign"
          >
            {isAssigning ? "Assigning..." : "Assign Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

