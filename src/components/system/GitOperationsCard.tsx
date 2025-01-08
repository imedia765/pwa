import { useState, useEffect } from 'react';
import { GitBranch, AlertCircle, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { GitOperationProgress } from './git/GitOperationProgress';
import { GitOperationLogs } from './git/GitOperationLogs';
import { QuickPushButton } from './git/QuickPushButton';
import { AddRepositoryDialog } from './git/AddRepositoryDialog';
import { useGitOperations } from './git/useGitOperations';

const GitOperationsCard = () => {
  const { toast } = useToast();
  const { 
    isProcessing,
    logs,
    currentOperation,
    progress,
    repositories,
    selectedRepo,
    showAddRepo,
    setShowAddRepo,
    setSelectedRepo,
    handlePushToRepo,
    fetchRepositories
  } = useGitOperations();

  return (
    <Card className="bg-dashboard-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-dashboard-accent1" />
            <CardTitle className="text-xl text-white">Git Operations</CardTitle>
          </div>
          <Button
            onClick={() => setShowAddRepo(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Repository
          </Button>
        </div>
        <CardDescription className="text-dashboard-muted">
          Manage Git operations and repository synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-dashboard-card/50 border-dashboard-accent1/20">
          <AlertCircle className="h-4 w-4 text-dashboard-accent1" />
          <AlertTitle className="text-dashboard-accent1">Important</AlertTitle>
          <AlertDescription className="text-dashboard-muted">
            Using stored GitHub token from Supabase secrets. Make sure it's configured in the Edge Functions settings.
          </AlertDescription>
        </Alert>

        <QuickPushButton isProcessing={isProcessing} />

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="repository">Custom Repository</Label>
            <select
              id="repository"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full p-2 rounded-md bg-dashboard-card border border-white/10 text-white"
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.repo_url} ({repo.branch})
                </option>
              ))}
            </select>
          </div>
        </div>

        {isProcessing && (
          <GitOperationProgress 
            currentOperation={currentOperation}
            progress={progress}
          />
        )}

        <Button
          onClick={handlePushToRepo}
          disabled={isProcessing || !selectedRepo}
          className="w-full bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
        >
          Push to Selected Repository
        </Button>

        <GitOperationLogs logs={logs} />

        <AddRepositoryDialog
          showAddRepo={showAddRepo}
          setShowAddRepo={setShowAddRepo}
          onRepositoryAdded={fetchRepositories}
        />
      </CardContent>
    </Card>
  );
};

export default GitOperationsCard;