import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { TotalCount } from "@/components/TotalCount";
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';
import { Download, Upload, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

type BackupHistoryRecord = Database['public']['Tables']['backup_history']['Row'];

const BackupHistory = () => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['backup-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('performed_at', { ascending: false });
      
      if (error) throw error;
      return data as BackupHistoryRecord[];
    }
  });

  if (isLoading) return <div>Loading history...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getOperationIcon = (type: 'backup' | 'restore') => {
    return type === 'backup' ? 
      <Download className="w-5 h-5" /> : 
      <Upload className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Backup History</h2>
      
      {history?.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No backup history available
        </div>
      ) : (
        <div className="space-y-4">
          {history?.map((record) => (
            <div 
              key={record.id} 
              className="bg-black/10 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getOperationIcon(record.operation_type)}
                  <div>
                    <h3 className="font-medium capitalize">
                      {record.operation_type} Operation
                    </h3>
                    <p className="text-sm text-gray-400">
                      {record.performed_at ? 
                        format(new Date(record.performed_at), 'PPpp') : 
                        'Date not available'}
                    </p>
                  </div>
                </div>
                {getStatusIcon(record.status || 'completed')}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <TotalCount 
                  items={[
                    { count: record.members_count || 0, label: "Members" },
                    { count: record.collectors_count || 0, label: "Collectors" },
                    { count: record.roles_count || 0, label: "Roles" },
                    { count: record.policies_count || 0, label: "Policies" }
                  ]}
                />
              </div>

              {record.error_message && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm">
                  {record.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackupHistory;