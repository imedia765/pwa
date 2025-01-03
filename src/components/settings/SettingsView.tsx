import BackupRestore from "./BackupRestore";

const SettingsView = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-8">
        <BackupRestore />
      </div>
    </div>
  );
};

export default SettingsView;