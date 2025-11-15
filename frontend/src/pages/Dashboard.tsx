import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import { MetricsCard } from '../components/MetricsCard';
import { StrategyChart } from '../components/StrategyChart';
import { EvolutionTimeline } from '../components/EvolutionTimeline';
import { useAppStore } from '../store/useAppStore';
import { strategyApi, evolutionApi } from '../services/api';

export const Dashboard = () => {
  const { user, strategies, currentStrategy, evolutionHistory, setStrategies, setEvolutionHistory, setIsLoading, setError } = useAppStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [strategiesRes, evolutionRes] = await Promise.all([
        strategyApi.getAll(),
        evolutionApi.getHistory()
      ]);

      if (strategiesRes.success && strategiesRes.data) {
        setStrategies(strategiesRes.data);
      }

      if (evolutionRes.success && evolutionRes.data) {
        setEvolutionHistory(evolutionRes.data);
      }

      // Generate mock chart data for now
      generateChartData();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEvolution = async () => {
    if (!user) {
      setError('Please login first');
      return;
    }

    setIsEvolving(true);
    setError(null);

    try {
      const response = await evolutionApi.synthesize(user.id);
      
      if (response.success && response.data) {
        // Reload data to show new strategy
        await loadData();
        setError(null);
        alert('🎉 Evolution Complete! Check the timeline below for improvements.');
      }
    } catch (error: any) {
      console.error('Evolution failed:', error);
      setError(error.message || 'Evolution failed. Check console for details.');
    } finally {
      setIsEvolving(false);
    }
  };

  const generateChartData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        base: 100 + Math.random() * 15,
        optimized: i > 10 ? 100 + Math.random() * 20 + 5 : undefined,
        hybrid: i > 20 ? 100 + Math.random() * 25 + 10 : undefined,
      });
    }

    setChartData(data);
  };

  const baseMetrics = currentStrategy?.metrics || {
    sharpe_ratio: 0.8,
    total_return: 12.5,
    max_drawdown: -18.2,
    win_rate: 54.3,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your strategy evolution and performance</p>
      </div>

      {/* Metrics Grid */}
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

      {/* Strategy Performance Chart */}
      <StrategyChart data={chartData} />

      {/* Evolution Timeline */}
      <EvolutionTimeline events={evolutionHistory} />

      {/* Evolution Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Evolution Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Next evolution in:</p>
            <p className="text-2xl font-bold text-primary">3 trades</p>
          </div>
          <button 
            className="btn-primary"
            onClick={triggerEvolution}
            disabled={isEvolving}
          >
            {isEvolving ? '⏳ Evolving...' : '🚀 Trigger Evolution Now'}
          </button>
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '70%' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Stage 3 agentic search will run at 20 trades</p>
      </div>
    </div>
  );
};

