import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BurialTimesSection = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-primary">Burial Times</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Out of hours burial (Monday to Friday only 4-7pm) may take place by special arrangement
        subject to availability of staff and safe lighting conditions: £180.00 per hour (50% reduction if less than 30 minutes)
      </p>
      <p className="text-sm text-muted-foreground mb-3">
        Fees are in addition to Exclusive Right of Burial, Interment and Chapel fees
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-foreground">Month</th>
              <th className="px-4 py-2 text-left text-foreground">Latest burial start time</th>
              <th className="px-4 py-2 text-left text-foreground">Burial conclusion time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-4 py-2">January</td>
              <td className="px-4 py-2">2.30pm</td>
              <td className="px-4 py-2">3.30pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">February</td>
              <td className="px-4 py-2">3.30pm</td>
              <td className="px-4 py-2">4.30pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">March</td>
              <td className="px-4 py-2">4.00pm</td>
              <td className="px-4 py-2">5.00pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">April-August</td>
              <td className="px-4 py-2">5.45pm</td>
              <td className="px-4 py-2">6.45pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">September</td>
              <td className="px-4 py-2">5.30pm</td>
              <td className="px-4 py-2">6.30pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">October</td>
              <td className="px-4 py-2">4.00pm</td>
              <td className="px-4 py-2">5.00pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">November</td>
              <td className="px-4 py-2">2.45pm</td>
              <td className="px-4 py-2">3.45pm</td>
            </tr>
            <tr>
              <td className="px-4 py-2">December</td>
              <td className="px-4 py-2">2.30pm</td>
              <td className="px-4 py-2">3.30pm</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
