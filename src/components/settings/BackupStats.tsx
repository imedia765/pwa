import { AlertCircle, Check } from "lucide-react";

interface BackupData {
  timestamp: string;
  members: any[];
  members_collectors: any[];
  user_roles: any[];
  policies: any[];
}

interface BackupStatsProps {
  data: BackupData | null;
  isRestoring?: boolean;
  restoredItems?: {
    members: number;
    collectors: number;
    roles: number;
  };
}

const BackupStats = ({ data, isRestoring, restoredItems }: BackupStatsProps) => {
  if (!data) return null;

  const stats = {
    members: data.members?.length || 0,
    collectors: data.members_collectors?.length || 0,
    roles: data.user_roles?.length || 0,
    policies: data.policies?.length || 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4 mt-4 bg-black/10 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Backup Statistics</h3>
        <span className="text-sm text-gray-400">
          {formatDate(data.timestamp)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-black/20 p-3 rounded-lg">
            <div className="text-sm text-gray-400 capitalize">{key}</div>
            <div className="text-xl font-semibold mt-1">
              {value}
              {isRestoring && key in (restoredItems || {}) && (
                <span className="text-sm text-green-400 ml-2">
                  <Check className="w-4 h-4 inline" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isRestoring && (
        <div className="flex items-center gap-2 text-yellow-400 mt-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Restore in progress...</span>
        </div>
      )}
    </div>
  );
};

export default BackupStats;