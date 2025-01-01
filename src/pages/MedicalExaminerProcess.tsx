import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ProcessFlowSection } from "@/components/medical-examiner/ProcessFlowSection";
import { SupportingDocsSection } from "@/components/medical-examiner/SupportingDocsSection";
import { CemeteryFeesSection } from "@/components/medical-examiner/CemeteryFeesSection";
import { BurialTimesSection } from "@/components/medical-examiner/BurialTimesSection";

const MedicalExaminerProcess = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4 text-foreground">Medical Examiner Process</h1>
          <p className="text-muted-foreground mb-6">
            This page provides detailed information about our Medical Examiner Death Certification process,
            including the flow chart and supporting documentation.
          </p>
        </div>

        <div className="space-y-6">
          <ProcessFlowSection />
          <SupportingDocsSection />
          <CemeteryFeesSection />
          <BurialTimesSection />
        </div>
      </div>
    </div>
  );
};

export default MedicalExaminerProcess;