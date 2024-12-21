import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function ProcessFlowSection() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Process Flow Chart
      </h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          View or download our comprehensive Medical Examiner Process Flow Chart:
        </p>
        <div className="flex flex-col items-center gap-4">
          <iframe
            src="/Flowchart-ME-Process-NBC-Final-1.pdf"
            className="w-full h-[500px] border border-border rounded-lg"
            title="Medical Examiner Process Flow Chart"
          >
            <p>Your browser does not support iframes.</p>
          </iframe>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.open('/Flowchart-ME-Process-NBC-Final-1.pdf', '_blank')}
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </Card>
  );
}