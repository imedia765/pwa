import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RoleSelect from './RoleSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ChevronDown, ChevronUp, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';

type UserRole = Database['public']['Enums']['app_role'];

interface UserRoleCardProps {
  user: {
    id: string;
    user_id: string;
    full_name: string;
    member_number: string;
    role: UserRole;
    auth_user_id: string;
    user_roles: { role: UserRole }[];
  };
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

interface AuthDebugInfo {
  lastSignIn?: string;
  lastFailedAttempt?: string;
  sessionStatus: 'active' | 'expired' | 'none';
  authErrors: string[];
  roleIssues: {
    type: string;
    description: string;
  }[];
  permissionIssues: {
    type: string;
    description: string;
  }[];
}

const UserRoleCard = ({ user, onRoleChange }: UserRoleCardProps) => {
  const [showDebug, setShowDebug] = useState(false);

  // Fetch auth debug information
  const { data: debugInfo } = useQuery({
    queryKey: ['auth-debug', user.id],
    queryFn: async (): Promise<AuthDebugInfo> => {
      try {
        // Fetch audit logs
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('table_name', 'auth')
          .order('timestamp', { ascending: false })
          .limit(5);

        // Check session status
        const { data: { session } } = await supabase.auth.getSession();
        
        // Get role-related issues
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.auth_user_id);

        const roleIssues: { type: string; description: string; }[] = [];
        const permissionIssues: { type: string; description: string; }[] = [];

        // Check for role mismatches
        if (roleData) {
          const assignedRoles = roleData.map(r => r.role);
          if (assignedRoles.length === 0) {
            roleIssues.push({
              type: 'No Role',
              description: 'User has no assigned roles'
            });
          }
          if (assignedRoles.length > 1) {
            roleIssues.push({
              type: 'Multiple Roles',
              description: `User has multiple roles: ${assignedRoles.join(', ')}`
            });
          }
          if (user.role && !assignedRoles.includes(user.role)) {
            roleIssues.push({
              type: 'Role Mismatch',
              description: `Display role (${user.role}) doesn't match assigned roles`
            });
          }
        }

        // Check for permission issues
        const { data: memberData } = await supabase
          .from('members')
          .select('*')
          .eq('auth_user_id', user.auth_user_id)
          .single();

        if (!memberData) {
          permissionIssues.push({
            type: 'No Member Profile',
            description: 'User has no associated member profile'
          });
        }

        const authErrors = (auditLogs || [])
          .filter(log => log.severity === 'error')
          .map(log => (typeof log.new_values === 'string' ? log.new_values : 'Unknown error'));

        const lastSignIn = auditLogs?.find(log => 
          log.operation === 'create' && !log.severity
        )?.timestamp;

        const lastFailedAttempt = auditLogs?.find(log => 
          log.severity === 'error'
        )?.timestamp;

        return {
          lastSignIn: lastSignIn ? new Date(lastSignIn).toLocaleString() : undefined,
          lastFailedAttempt: lastFailedAttempt ? new Date(lastFailedAttempt).toLocaleString() : undefined,
          sessionStatus: session ? 'active' : 'none',
          authErrors,
          roleIssues,
          permissionIssues
        };
      } catch (error) {
        console.error('Error in debug info fetch:', error);
        return {
          sessionStatus: 'none',
          authErrors: ['Error fetching debug information'],
          roleIssues: [],
          permissionIssues: []
        };
      }
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-5 bg-dashboard-card/50 rounded-lg border border-dashboard-cardBorder hover:border-dashboard-cardBorderHover transition-all duration-200">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-white font-medium">{user.full_name}</p>
            <p className="text-dashboard-text text-sm">ID: {user.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <RoleSelect 
            currentRole={user.role} 
            userId={user.user_id} 
            onRoleChange={(newRole) => onRoleChange(user.user_id, newRole)} 
          />
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="p-2 hover:bg-dashboard-cardHover rounded-full transition-colors"
          >
            {showDebug ? (
              <ChevronUp className="h-5 w-5 text-dashboard-info" />
            ) : (
              <ChevronDown className="h-5 w-5 text-dashboard-info" />
            )}
          </button>
        </div>
      </div>

      {showDebug && debugInfo && (
        <div className="px-5 py-4 bg-dashboard-card/30 rounded-lg border border-dashboard-cardBorder">
          <h4 className="text-sm font-medium text-dashboard-accent1 mb-3">Debug Information</h4>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] text-dashboard-accent2">Metric</TableHead>
                <TableHead className="text-dashboard-accent2">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-dashboard-text">Last Sign In</TableCell>
                <TableCell className="text-white">{debugInfo.lastSignIn || 'Never'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-dashboard-text">Session Status</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    debugInfo.sessionStatus === 'active' 
                      ? 'bg-dashboard-success/20 text-dashboard-success' 
                      : 'bg-dashboard-error/20 text-dashboard-error'
                  }`}>
                    {debugInfo.sessionStatus}
                  </span>
                </TableCell>
              </TableRow>
              {debugInfo.lastFailedAttempt && (
                <TableRow>
                  <TableCell className="text-dashboard-text">Last Failed Attempt</TableCell>
                  <TableCell className="text-dashboard-error">{debugInfo.lastFailedAttempt}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Role Issues Section */}
          {debugInfo.roleIssues && debugInfo.roleIssues.length > 0 && (
            <div className="mt-4">
              <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/20">
                <Shield className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">Role Issues Detected</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {debugInfo.roleIssues.map((issue, index) => (
                      <li key={index} className="text-sm">
                        <Badge variant="outline" className="mr-2">{issue.type}</Badge>
                        {issue.description}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Permission Issues Section */}
          {debugInfo.permissionIssues && debugInfo.permissionIssues.length > 0 && (
            <div className="mt-4">
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-500">Permission Issues Detected</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {debugInfo.permissionIssues.map((issue, index) => (
                      <li key={index} className="text-sm">
                        <Badge variant="outline" className="mr-2">{issue.type}</Badge>
                        {issue.description}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Auth Errors Section */}
          {debugInfo.authErrors && debugInfo.authErrors.length > 0 && (
            <div className="mt-4">
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm font-medium mb-2">Recent Auth Errors</div>
                  <ul className="list-disc list-inside space-y-1">
                    {debugInfo.authErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRoleCard;