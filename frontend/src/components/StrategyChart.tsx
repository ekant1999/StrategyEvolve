import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StrategyChartProps {
  data: Array<{
    date: string;
    base: number;
    optimized?: number;
    hybrid?: number;
    evolved?: number;
  }>;
  title?: string;
}

export const StrategyChart = ({ data, title = 'Strategy Performance' }: StrategyChartProps) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="base" 
            stroke="#6b7280" 
            strokeWidth={2}
            name="Base Strategy"
          />
          {data.some(d => d.optimized) && (
            <Line 
              type="monotone" 
              dataKey="optimized" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Optimized"
            />
          )}
          {data.some(d => d.hybrid) && (
            <Line 
              type="monotone" 
              dataKey="hybrid" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Hybrid (Evolved)"
            />
          )}
          {data.some(d => d.evolved && !d.hybrid && !d.optimized) && (
            <Line 
              type="monotone" 
              dataKey="evolved" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Evolved Strategy"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

