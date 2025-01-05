import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserRole = 'member' | 'collector' | 'admin' | null;

const ROLE_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const useRoleAccess = () => {
  const { toast } = useToast();

  const { data: userRole, isLoading: roleLoading, error } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      console.log('Fetching user role from central hook...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No session found in central role check');
        return null;
      }

      console.log('Session user in central role check:', session.user.id);
      console.log('User metadata:', session.user.user_metadata);

      // First try to get role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (roleError) {
        console.error('Error fetching role from user_roles:', roleError);
      }

      if (roleData?.length > 0) {
        console.log('Found roles in user_roles table:', roleData);
        // If user has admin role, return that
        if (roleData.some(r => r.role === 'admin')) {
          return 'admin' as UserRole;
        }
        // If user has collector role, return that
        if (roleData.some(r => r.role === 'collector')) {
          return 'collector' as UserRole;
        }
        // Otherwise return member role
        if (roleData.some(r => r.role === 'member')) {
          return 'member' as UserRole;
        }
      }

      // If no role in user_roles table, check if user is a collector
      const { data: collectorData, error: collectorError } = await supabase
        .from('members_collectors')
        .select('name')
        .eq('member_number', session.user.user_metadata.member_number);

      if (collectorError) {
        console.error('Error checking collector status:', collectorError);
      }

      if (collectorData?.length > 0) {
        console.log('User is a collector based on members_collectors table');
        return 'collector' as UserRole;
      }

      // If still no role found, check if user exists in members table
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error checking member status:', memberError);
      }

      if (memberData?.id) {
        console.log('User is a regular member');
        return 'member' as UserRole;
      }

      console.log('No role found, defaulting to member');
      return 'member' as UserRole;
    },
    staleTime: ROLE_STALE_TIME,
    retry: 2,
    meta: {
      errorMessage: "Failed to fetch user role"
    }
  });

  const canAccessTab = (tab: string): boolean => {
    console.log('Checking access for tab:', tab, 'User role:', userRole);
    
    if (!userRole) return false;

    switch (userRole) {
      case 'admin':
        return true;
      case 'collector':
        return ['dashboard', 'users'].includes(tab);
      case 'member':
        return tab === 'dashboard';
      default:
        return false;
    }
  };

  return {
    userRole,
    roleLoading,
    error,
    canAccessTab,
  };
};
