import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import { MetricsCard } from '../components/MetricsCard';
import { StrategyChart } from '../components/StrategyChart';
import { EvolutionTimeline } from '../components/EvolutionTimeline';
import { useAppStore } from '../store/useAppStore';
import { strategyApi, evolutionApi, tradeApi } from '../services/api';

export const Dashboard = () => {
  const { user, currentStrategy, evolutionHistory, trades, setStrategies, setEvolutionHistory, setTrades, setIsLoading, setError } = useAppStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [userMetrics, setUserMetrics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log(`📊 Loading dashboard data for user: ${user.id}`);
      const [strategiesRes, evolutionRes, tradesRes] = await Promise.all([
        strategyApi.getAll(user.id),
        evolutionApi.getHistory(user.id),
        tradeApi.getAll(user.id)
      ]);

      if (strategiesRes.success && strategiesRes.data) {
        setStrategies(strategiesRes.data);
        // Set current strategy to the latest hybrid or optimized strategy
        const latestStrategy = strategiesRes.data
          .filter(s => s.type === 'hybrid' || s.type === 'optimized')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        if (latestStrategy) {
          useAppStore.getState().setCurrentStrategy(latestStrategy);
        } else if (strategiesRes.data.length > 0) {
          useAppStore.getState().setCurrentStrategy(strategiesRes.data[0]);
        }
      }

      if (evolutionRes.success && evolutionRes.data) {
        setEvolutionHistory(evolutionRes.data);
      }

      if (tradesRes.success && tradesRes.data) {
        setTrades(tradesRes.data);
        // Calculate metrics from user trades
        const metrics = calculateUserMetrics(tradesRes.data);
        setUserMetrics(metrics);
        // Generate chart data from strategies if available
        generateChartDataFromStrategies(strategiesRes.data || []);
      } else {
        // No trades yet - show empty state
        setChartData([]);
        setUserMetrics(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateUserMetrics = (userTrades: any[]) => {
    if (!userTrades || userTrades.length === 0) return null;

    const completedTrades = userTrades.filter(t => t.outcome);
    if (completedTrades.length === 0) return null;

    let totalReturn = 0;
    let wins = 0;
    let totalProfit = 0;
    let maxDrawdown = 0;
    let peak = 0;
    let currentEquity = 100000; // Starting capital

    completedTrades.forEach(trade => {
      if (trade.outcome) {
        const tradeReturn = trade.outcome.return_pct;
        totalReturn += tradeReturn;
        totalProfit += (trade.price * trade.quantity * tradeReturn / 100);
        if (tradeReturn > 0) wins++;
        
        currentEquity += totalProfit;
        if (currentEquity > peak) peak = currentEquity;
        const drawdown = ((peak - currentEquity) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
    });

    const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;
    const avgReturn = completedTrades.length > 0 ? totalReturn / completedTrades.length : 0;
    
    // Simple Sharpe approximation (would need daily returns for real Sharpe)
    const sharpeRatio = avgReturn > 0 ? avgReturn / (Math.abs(maxDrawdown) + 1) : 0;

    return {
      sharpe_ratio: sharpeRatio,
      total_return: totalReturn,
      max_drawdown: -maxDrawdown,
      win_rate: winRate,
      num_trades: completedTrades.length,
    };
  };

  const generateChartDataFromStrategies = (allStrategies: any[]) => {
    if (allStrategies.length === 0) {
      setChartData([]);
      return;
    }

    console.log('📊 Generating chart with', allStrategies.length, 'strategies');

    const baseStrategy = allStrategies.find(s => s.type === 'base');
    const latestEvolved = allStrategies
      .filter(s => s.type === 'hybrid' || s.type === 'optimized')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    const baseReturn = baseStrategy?.metrics?.total_return || 0;
    const evolvedReturn = latestEvolved?.metrics?.total_return || baseReturn;

    console.log('📊 Base return:', baseReturn, 'Evolved return:', evolvedReturn);

    const data: any[] = [];
    const baseValue = 100;

    for (let i = 0; i <= 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (60 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const progress = i / 60;
      const dayData: any = {
        date: dateStr,
        base: baseValue * (1 + (baseReturn / 100) * progress),
      };

      if (latestEvolved) {
        dayData.hybrid = baseValue * (1 + (evolvedReturn / 100) * progress);
      }

      data.push(dayData);
    }

    console.log('📊 Generated', data.length, 'data points');
    setChartData(data);
  };

  const triggerEvolution = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    if (trades.length === 0) {
      setError('Please log at least one trade before triggering evolution');
      return;
    }

    setIsEvolving(true);
    setError(null);

    try {
      console.log('🚀 Triggering evolution for user:', user.id);
      const response = await evolutionApi.synthesize(user.id);
      
      if (response.success && response.data) {
        // Force a full reload to get updated strategies and metrics
        console.log('🔄 Reloading data after evolution...');
        await loadData();
        
        // Also force a state update to ensure UI refreshes
        setTimeout(() => {
          loadData();
        }, 1000);
        
        setError(null);
        alert('🎉 Evolution Complete! Check the timeline below for improvements.');
      } else {
        setError(response.error || 'Evolution completed but no strategy was returned');
      }
    } catch (error: any) {
      console.error('Evolution failed:', error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          'Evolution failed. Please check console for details.';
      setError(errorMessage);
    } finally {
      setIsEvolving(false);
    }
  };

  // Use real metrics from current strategy or user trades, fallback to null
  const baseMetrics = currentStrategy?.metrics || userMetrics || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your strategy evolution and performance</p>
      </div>

      {/* Metrics Grid */}
      {baseMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Sharpe Ratio"
            value={baseMetrics.sharpe_ratio}
            change={evolutionHistory.length > 0 ? 
              (evolutionHistory[evolutionHistory.length - 1].improvement.sharpe_delta / baseMetrics.sharpe_ratio) * 100 : 
              undefined}
            icon={<TrendingUp />}
          />
          <MetricsCard
            title="Total Return"
            value={baseMetrics.total_return}
            format="percentage"
            change={evolutionHistory.length > 0 ? 
              evolutionHistory[evolutionHistory.length - 1].improvement.return_delta : 
              undefined}
            icon={<DollarSign />}
          />
          <MetricsCard
            title="Win Rate"
            value={baseMetrics.win_rate}
            format="percentage"
            icon={<Target />}
          />
          <MetricsCard
            title="Max Drawdown"
            value={Math.abs(baseMetrics.max_drawdown)}
            format="percentage"
            icon={<Activity />}
          />
        </div>
      ) : (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No strategy metrics available yet</p>
            <p className="text-sm text-gray-400">
              {trades.length === 0 
                ? "Log some trades to start building your strategy performance metrics"
                : "Complete some trades with outcomes to see your performance metrics"}
            </p>
          </div>
        </div>
      )}

      {/* Strategy Performance Chart */}
      {chartData.length > 0 ? (
        <StrategyChart data={chartData} />
      ) : (
        <div className="card">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No strategy performance data yet</p>
            <p className="text-sm text-gray-400">
              Trigger an evolution to see strategy performance over time
            </p>
          </div>
        </div>
      )}

      {/* Evolution Timeline */}
      <EvolutionTimeline events={evolutionHistory} />

      {/* Evolution Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Evolution Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Trades logged:</p>
            <p className="text-2xl font-bold text-primary">{trades.length} trades</p>
            {trades.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {trades.filter(t => t.outcome).length} completed, {trades.filter(t => !t.outcome).length} pending
              </p>
            )}
          </div>
          <button 
            className="btn-primary"
            onClick={triggerEvolution}
            disabled={isEvolving || trades.length === 0}
            title={trades.length === 0 ? "Log some trades first to enable evolution" : ""}
          >
            {isEvolving ? '⏳ Evolving...' : '🚀 Trigger Evolution Now'}
          </button>
        </div>
        {trades.length > 0 && (
          <>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (trades.length / 20) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {trades.length < 20 
                ? `Stage 3 agentic search will run at 20 trades (${20 - trades.length} more needed)`
                : "Ready for Stage 3 agentic search"}
            </p>
          </>
        )}
        {trades.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">
            Start logging trades to enable strategy evolution. The model will learn from your trading patterns and current market conditions.
          </p>
        )}
      </div>
    </div>
  );
};

