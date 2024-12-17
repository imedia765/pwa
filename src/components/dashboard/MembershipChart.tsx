import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MembershipChartProps {
  data: Array<{
    month: string;
    members: number;
    revenue: number;
  }>;
}

export function MembershipChart({ data }: MembershipChartProps) {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Membership & Revenue Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="members" fill="hsl(var(--primary))" name="Members" />
              <Bar yAxisId="right" dataKey="revenue" fill="hsl(var(--primary)/0.5)" name="Revenue (£)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}