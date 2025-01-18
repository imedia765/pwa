import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCollectorSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncRolesMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('perform_user_roles_sync');
      if (error) throw error;
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['members_collectors'] });
        toast({
          title: "Roles synchronized",
          description: "The roles have been synchronized successfully.",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error syncing roles",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  return syncRolesMutation;
};