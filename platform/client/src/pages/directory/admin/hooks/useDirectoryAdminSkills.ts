import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useDirectoryAdminSkills() {
  const { toast } = useToast();

  const deleteSkill = useMutation({
    mutationFn: async (skillId: string) => {
      // Use the hierarchical skills API endpoint with skill ID
      return apiRequest("DELETE", `/api/skills/skills/${skillId}`);
    },
    onSuccess: async () => {
      // Invalidate both the Directory admin skills list and the main skills hierarchy
      await queryClient.invalidateQueries({ queryKey: ["/api/directory/admin/skills"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/skills/hierarchy"] });
      toast({ title: "Deleted", description: "Skill deleted successfully" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message || "Failed to delete skill", variant: "destructive" }),
  });

  return {
    deleteSkill,
  };
}

