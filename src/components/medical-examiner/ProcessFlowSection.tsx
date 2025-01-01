import { Card, CardContent } from "@/components/ui/card";

export const ProcessFlowSection = () => {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4 text-primary">Process Flow Chart</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          View or download our comprehensive Medical Examiner Process Flow Chart:
        </p>
        <object
          data="/flowchart.pdf"
          type="application/pdf"
          width="100%"
          height="500px"
          className="mb-4"
        >
          <p className="text-muted-foreground">
            Unable to display PDF file.{" "}
            <a
              href="/flowchart.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Download PDF
            </a>
          </p>
        </object>
      </div>
    </div>
  );
};