import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useRoleStore } from '@/store/roleStore';
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type UserRole = Database['public']['Enums']['app_role'];

export const useEnhancedRoleAccess = () => {
  const { toast } = useToast();
  const setUserRoles = useRoleStore((state) => state.setUserRoles);
  const setUserRole = useRoleStore((state) => state.setUserRole);
  const setIsLoading = useRoleStore((state) => state.setIsLoading);
  const setError = useRoleStore((state) => state.setError);
  const setPermissions = useRoleStore((state) => state.setPermissions);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      console.log('Fetching user roles - start');
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No authenticated session found');
          setUserRoles(null);
          setUserRole(null);
          return null;
        }

        console.log('Fetching roles for user:', session.user.id);
        
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
          toast({
            title: "Error fetching roles",
            description: "There was a problem loading your access permissions.",
            variant: "destructive",
          });
          throw rolesError;
        }

        const userRoles = roles?.map(r => r.role as UserRole) || ['member'];
        console.log('Fetched roles:', userRoles);

        // Force a new reference for the array to ensure React detects the change
        const userRolesCopy = [...userRoles];
        
        // Set primary role (admin > collector > member)
        const primaryRole = userRoles.includes('admin' as UserRole) 
          ? 'admin' as UserRole 
          : userRoles.includes('collector' as UserRole)
            ? 'collector' as UserRole
            : 'member' as UserRole;

        // Update state with new references to trigger re-renders
        setUserRoles(userRolesCopy);
        setUserRole(primaryRole);
        
        return userRolesCopy;
      } catch (error: any) {
        console.error('Role fetch error:', error);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    retry: 1
  });

  return {
    userRoles: data,
    isLoading,
    error,
  };
};