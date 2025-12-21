import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useDirectoryAdminSkills() {
  const { toast } = useToast();

  const deleteSkill = useMutation({
    mutationFn: async (skillName: string) => {
      // Send skill name in request body to avoid URL encoding issues
      return apiRequest("DELETE", "/api/directory/admin/skills", { name: skillName });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/directory/admin/skills"] });
      toast({ title: "Deleted", description: "Skill deleted successfully" });
    },
    onError: (e: any) =>
      toast({ title: "Error", description: e.message || "Failed to delete skill", variant: "destructive" }),
  });

  return {
    deleteSkill,
  };
}

