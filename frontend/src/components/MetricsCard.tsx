import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: 'number' | 'percentage' | 'currency';
  icon?: React.ReactNode;
}

export const MetricsCard = ({ title, value, change, format = 'number', icon }: MetricsCardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(2)}%`;
      case 'currency':
        return `$${val.toFixed(2)}`;
      default:
        return val.toFixed(2);
    }
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm text-gray-500">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="metric-value">{formatValue(value)}</div>
      
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-gray-500'}`}>
          {isPositive && <ArrowUp size={16} />}
          {isNegative && <ArrowDown size={16} />}
          <span>{Math.abs(change).toFixed(2)}%</span>
        </div>
      )}
    </div>
  );
};

