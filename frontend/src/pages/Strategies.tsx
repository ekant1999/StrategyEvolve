import { useEffect, useState } from 'react';
import { TrendingUp, Activity, Target, BarChart3 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { strategyApi } from '../services/api';
import type { Strategy } from '../types';

export const Strategies = () => {
  const { user, setIsLoading } = useAppStore();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    if (user) {
      loadStrategies();
    }
  }, [user]);

  const loadStrategies = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log(`📊 Loading strategies for user: ${user.id}`);
      const response = await strategyApi.getAll(user.id);
      if (response.success && response.data) {
        // Sort by creation date, newest first
        const sorted = response.data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setStrategies(sorted);
        if (sorted.length > 0 && !selectedStrategy) {
          setSelectedStrategy(sorted[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load strategies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrategyTypeColor = (type: string) => {
    switch (type) {
      case 'hybrid':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'optimized':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'base':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case 'hybrid':
        return <Activity className="text-green-600" size={20} />;
      case 'optimized':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'base':
        return <Target className="text-gray-600" size={20} />;
      default:
        return <BarChart3 className="text-gray-600" size={20} />;
    }
  };

  if (!user) {
    return <div className="card">Please login to view strategies.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Strategies</h1>
          <p className="text-gray-600 mt-1">View and compare all evolved strategies</p>
        </div>
        <div className="text-sm text-gray-500">
          {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}
        </div>
      </div>

      {strategies.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Strategies Yet</h3>
          <p className="text-gray-600 mb-4">Trigger evolution from the Dashboard to create strategies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">All Strategies</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {strategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedStrategy?.id === strategy.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStrategyTypeIcon(strategy.type)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStrategyTypeColor(strategy.type)}`}>
                          {strategy.type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(strategy.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{strategy.name}</h3>
                    {strategy.metrics && (
                      <div className="text-xs text-gray-600 mt-2">
                        <div>Sharpe: {strategy.metrics.sharpe_ratio.toFixed(2)}</div>
                        <div>Return: {strategy.metrics.total_return.toFixed(2)}%</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Strategy Details */}
          <div className="lg:col-span-2">
            {selectedStrategy ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStrategyTypeIcon(selectedStrategy.type)}
                      <h2 className="text-2xl font-bold text-gray-900">{selectedStrategy.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStrategyTypeColor(selectedStrategy.type)}`}>
                        {selectedStrategy.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(selectedStrategy.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Parameters */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Parameters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">MA Short</div>
                      <div className="text-xl font-bold text-gray-900">
                        {selectedStrategy.parameters.ma_short.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">MA Long</div>
                      <div className="text-xl font-bold text-gray-900">
                        {selectedStrategy.parameters.ma_long.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">RSI Threshold</div>
                      <div className="text-xl font-bold text-gray-900">
                        {selectedStrategy.parameters.rsi_threshold.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Position Size</div>
                      <div className="text-xl font-bold text-gray-900">
                        {(selectedStrategy.parameters.position_size * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                {selectedStrategy.metrics ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 mb-1">Sharpe Ratio</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {selectedStrategy.metrics.sharpe_ratio.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 mb-1">Total Return</div>
                        <div className="text-2xl font-bold text-green-900">
                          {selectedStrategy.metrics.total_return.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-red-600 mb-1">Max Drawdown</div>
                        <div className="text-2xl font-bold text-red-900">
                          {selectedStrategy.metrics.max_drawdown.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 mb-1">Win Rate</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {selectedStrategy.metrics.win_rate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm text-yellow-600 mb-1">Avg Trade Duration</div>
                        <div className="text-2xl font-bold text-yellow-900">
                          {selectedStrategy.metrics.avg_trade_duration.toFixed(1)} days
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="text-sm text-indigo-600 mb-1">Total Trades</div>
                        <div className="text-2xl font-bold text-indigo-900">
                          {selectedStrategy.metrics.num_trades}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No metrics available yet. This strategy hasn't been backtested.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600">Select a strategy to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

