import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { month: 'J', value: 30, revenue: 40 },
  { month: 'F', value: 35, revenue: 45 },
  { month: 'M', value: 40, revenue: 35 },
  { month: 'A', value: 38, revenue: 30 },
  { month: 'M', value: 42, revenue: 25 },
  { month: 'J', value: 48, revenue: 40 },
  { month: 'J', value: 45, revenue: 45 },
  { month: 'A', value: 43, revenue: 50 },
  { month: 'S', value: 44, revenue: 45 },
  { month: 'O', value: 45, revenue: 55 },
  { month: 'N', value: 47, revenue: 50 },
  { month: 'D', value: 49, revenue: 60 },
];

const MonthlyChart = () => {
  return (
    <div className="dashboard-card h-[400px]">
      <h2 className="text-xl font-medium mb-6">Monthly Income</h2>
      <div className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#828179" />
            <YAxis stroke="#828179" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8989DE"
              strokeWidth={2}
              dot={{ fill: '#8989DE' }}
            />
            <Bar dataKey="revenue" fill="#61AAF2" opacity={0.3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;