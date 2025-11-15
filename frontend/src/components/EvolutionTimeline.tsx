import { CheckCircle, TrendingUp, Brain, Zap } from 'lucide-react';
import type { EvolutionEvent } from '../types';

interface EvolutionTimelineProps {
  events: EvolutionEvent[];
}

export const EvolutionTimeline = ({ events }: EvolutionTimelineProps) => {
  const getIcon = (type: EvolutionEvent['type']) => {
    switch (type) {
      case 'quantitative':
        return <TrendingUp className="text-primary" />;
      case 'behavioral':
        return <Brain className="text-purple-500" />;
      case 'hybrid':
        return <Zap className="text-success" />;
    }
  };

  const getTypeColor = (type: EvolutionEvent['type']) => {
    switch (type) {
      case 'quantitative':
        return 'bg-blue-100 text-blue-700';
      case 'behavioral':
        return 'bg-purple-100 text-purple-700';
      case 'hybrid':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Evolution Timeline</h3>
      
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No evolution events yet. Start trading to see evolution!</p>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {getIcon(event.type)}
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-16 bg-gray-200 my-1" />
                )}
              </div>
              
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Sharpe Improvement:</span>
                    <span className={`ml-2 font-semibold ${event.improvement.sharpe_delta > 0 ? 'text-success' : 'text-danger'}`}>
                      {event.improvement.sharpe_delta > 0 ? '+' : ''}
                      {event.improvement.sharpe_delta.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Return Improvement:</span>
                    <span className={`ml-2 font-semibold ${event.improvement.return_delta > 0 ? 'text-success' : 'text-danger'}`}>
                      {event.improvement.return_delta > 0 ? '+' : ''}
                      {event.improvement.return_delta.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-gray-600">{event.insights}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

