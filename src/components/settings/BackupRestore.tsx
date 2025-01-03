import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import BackupStats from './BackupStats';
import BackupHistory from './BackupHistory';

const BackupRestore = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoredItems, setRestoredItems] = useState({
    members: 0,
    collectors: 0,
    roles: 0
  });

  const recordOperation = async (
    type: 'backup' | 'restore',
    stats: any,
    status: 'completed' | 'failed' = 'completed',
    error?: string,
    fileName?: string
  ) => {
    try {
      await supabase.from('backup_history').insert({
        operation_type: type,
        members_count: stats.members?.length || 0,
        collectors_count: stats.members_collectors?.length || 0,
        roles_count: stats.user_roles?.length || 0,
        policies_count: stats.policies?.length || 0,
        status,
        error_message: error,
        backup_file_name: fileName
      });
    } catch (error) {
      console.error('Failed to record operation:', error);
    }
  };

  const generateBackup = async () => {
    try {
      setIsGenerating(true);
      const { data, error } = await supabase.rpc('generate_full_backup');
      
      if (error) throw error;

      setBackupData(data);

      // Create and download the backup file
      const fileName = `backup-${new Date().toISOString()}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Record the backup operation
      await recordOperation('backup', data, 'completed', undefined, fileName);

      toast({
        title: "Backup Generated",
        description: "Your backup file has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Backup generation error:', error);
      await recordOperation('backup', backupData || {}, 'failed', error.message);
      toast({
        title: "Error",
        description: "Failed to generate backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      setRestoreProgress(0);
      setRestoredItems({
        members: 0,
        collectors: 0,
        roles: 0
      });

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          setBackupData(backupData);
          
          // Simulate progress for different stages
          setRestoreProgress(25);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { error } = await supabase.rpc('restore_from_backup', {
            backup_data: backupData
          });

          if (error) throw error;

          // Update restored items count
          const restoredCounts = {
            members: backupData.members?.length || 0,
            collectors: backupData.members_collectors?.length || 0,
            roles: backupData.user_roles?.length || 0
          };
          
          setRestoredItems(restoredCounts);
          setRestoreProgress(100);

          // Record the restore operation
          await recordOperation('restore', backupData, 'completed', undefined, file.name);

          toast({
            title: "Restore Completed",
            description: "System has been restored from backup successfully.",
          });
        } catch (error: any) {
          console.error('Restore error:', error);
          await recordOperation('restore', backupData, 'failed', error.message, file.name);
          toast({
            title: "Error",
            description: "Failed to restore from backup. Please ensure the backup file is valid.",
            variant: "destructive",
          });
        } finally {
          setIsRestoring(false);
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error('File reading error:', error);
      await recordOperation('restore', {}, 'failed', error.message);
      toast({
        title: "Error",
        description: "Failed to read backup file. Please try again.",
        variant: "destructive",
      });
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Backup & Restore</h2>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Backup includes all members, collectors, roles, and security configurations.
          Restoring will replace all existing data with the backup data.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Button
          onClick={generateBackup}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate Backup"}
        </Button>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleRestore}
            disabled={isRestoring}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            disabled={isRestoring}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Upload className="w-4 h-4" />
            {isRestoring ? "Restoring..." : "Restore from Backup"}
          </Button>
        </div>
      </div>

      {isRestoring && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Restore Progress</span>
            <span>{restoreProgress}%</span>
          </div>
          <Progress value={restoreProgress} className="h-2" />
        </div>
      )}

      {backupData && (
        <BackupStats 
          data={backupData}
          isRestoring={isRestoring}
          restoredItems={restoredItems}
        />
      )}

      <BackupHistory />
    </div>
  );
};

export default BackupRestore;