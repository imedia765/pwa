import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

const MonthlyChart = () => {
  const { data: paymentHistory } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: async () => {
      console.log('Fetching payment history...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user logged in');

      const { data: memberData } = await supabase
        .from('members')
        .select('yearly_payment_amount, emergency_collection_amount, yearly_payment_status, emergency_collection_status')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (!memberData) {
        console.error('No member data found');
        return [];
      }

      // Generate last 12 months of data
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        months.push({
          month: date.toLocaleString('default', { month: 'short' }),
          annualPayment: memberData.yearly_payment_status === 'completed' ? memberData.yearly_payment_amount || 40 : 0,
          emergencyPayment: memberData.emergency_collection_status === 'completed' ? memberData.emergency_collection_amount || 0 : 0,
        });
      }

      return months;
    },
  });

  return (
    <div className="dashboard-card h-[400px]">
      <h2 className="text-xl font-medium mb-6">Payment History</h2>
      <div className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={paymentHistory || []} 
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              stroke="#828179"
              tick={{ fill: '#828179' }}
            />
            <YAxis 
              stroke="#828179"
              tick={{ fill: '#828179' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#828179' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ color: '#828179' }}
            />
            <Line
              type="monotone"
              dataKey="annualPayment"
              name="Annual Payment"
              stroke="#8989DE"
              strokeWidth={2}
              dot={{ fill: '#8989DE' }}
            />
            <Line
              type="monotone"
              dataKey="emergencyPayment"
              name="Emergency Payment"
              stroke="#61AAF2"
              strokeWidth={2}
              dot={{ fill: '#61AAF2' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;