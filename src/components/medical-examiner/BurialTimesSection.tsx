import { Card } from "@/components/ui/card";

export function BurialTimesSection() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Burial Times and Regulations
      </h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#33C3F0]">Out of Hours Burial</h3>
          <p className="mb-4 text-muted-foreground">Out of hours burial (Monday to Friday only 4-7pm) may take place by special arrangement subject to availability of staff and safe lighting conditions.</p>
          <p className="font-semibold mb-4">£180.00 per hour (50% reduction if less than 30 minutes)</p>
          <p className="text-muted-foreground">Fees are in addition to Exclusive Right of Burial, Interment and Chapel fees</p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-[#33C3F0]">Burial Times</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-muted-foreground">Month</th>
                  <th className="text-left py-2 px-4 text-muted-foreground">Latest burial start time</th>
                  <th className="text-left py-2 px-4 text-muted-foreground">Burial conclusion time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["January", "2.30pm", "3.30pm"],
                  ["February", "3.30pm", "4.30pm"],
                  ["March", "4.00pm", "5.00pm"],
                  ["April-August", "5.45pm", "6.45pm"],
                  ["September", "5.30pm", "6.30pm"],
                  ["October", "4.00pm", "5.00pm"],
                  ["November", "2.45pm", "3.45pm"],
                  ["December", "2.30pm", "3.30pm"]
                ].map(([month, start, end]) => (
                  <tr key={month} className="border-b">
                    <td className="py-2 px-4 text-muted-foreground">{month}</td>
                    <td className="py-2 px-4 text-muted-foreground">{start}</td>
                    <td className="py-2 px-4 text-muted-foreground">{end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Card>
  );
}