import { useEffect } from 'react';
import { TradeForm } from '../components/TradeForm';
import { useAppStore } from '../store/useAppStore';
import { tradeApi } from '../services/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Trade } from '../types';

export const Trades = () => {
  const { user, trades, setTrades, setIsLoading } = useAppStore();

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await tradeApi.getAll(user.id);
      if (response.success && response.data) {
        setTrades(response.data);
      }
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOutcomeIcon = (trade: Trade) => {
    if (!trade.outcome) {
      return <Clock className="text-gray-400" size={20} />;
    }
    return trade.outcome.return_pct > 0 ? 
      <CheckCircle className="text-success" size={20} /> :
      <XCircle className="text-danger" size={20} />;
  };

  const getOutcomeColor = (trade: Trade) => {
    if (!trade.outcome) return 'text-gray-500';
    return trade.outcome.return_pct > 0 ? 'text-success' : 'text-danger';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trade History</h1>
        <p className="text-gray-600 mt-1">Log trades and help the agent learn your unique edge</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Form */}
        <div className="lg:col-span-1">
          <TradeForm />
        </div>

        {/* Trade List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
            
            {trades.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No trades yet. Log your first trade to start learning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trades.slice().reverse().map((trade) => (
                  <div key={trade.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {getOutcomeIcon(trade)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">{trade.ticker}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                trade.action === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {trade.action}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {trade.quantity} shares @ ${trade.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-1">
                          <p className="text-sm">
                            <span className="text-gray-500">Strategy Signal:</span> {trade.strategy_signal}
                          </p>
                          {trade.user_reasoning && (
                            <p className="text-sm">
                              <span className="text-gray-500">Your Reasoning:</span> {trade.user_reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        {trade.outcome ? (
                          <div>
                            <div className={`text-xl font-bold ${getOutcomeColor(trade)}`}>
                              {trade.outcome.return_pct > 0 ? '+' : ''}
                              {trade.outcome.return_pct.toFixed(2)}%
                            </div>
                            <p className="text-xs text-gray-500">{trade.outcome.duration_days} days</p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Pending
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

