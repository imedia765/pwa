import { Button } from "@/components/ui/button";

const MedicalExaminer = () => {
  return (
    <div className="bg-dashboard-card rounded-lg shadow-lg p-8 mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">Medical Examiner Process</h2>
      <p className="text-dashboard-text mb-4">
        To understand our comprehensive Medical Examiner Death Certification process, please review our detailed Medical Examiner Flow Chart.
      </p>
      <Button variant="outline" className="text-dashboard-accent1 border-dashboard-accent1 hover:bg-dashboard-accent1 hover:text-white">
        View Flow Chart
      </Button>
    </div>
  );
};

export default MedicalExaminer;