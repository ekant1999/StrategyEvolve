import { useState } from 'react';
import { tradeApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export const TradeForm = () => {
  const { user, addTrade, setIsLoading, setError } = useAppStore();
  const [formData, setFormData] = useState({
    ticker: '',
    action: 'BUY' as 'BUY' | 'SELL',
    quantity: '',
    price: '',
    strategy_signal: '',
    user_reasoning: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const trade = {
        user_id: user.id,
        ticker: formData.ticker.toUpperCase(),
        action: formData.action,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        strategy_signal: formData.strategy_signal,
        user_reasoning: formData.user_reasoning || undefined,
      };

      const response = await tradeApi.create(trade);
      
      if (response.success && response.data) {
        addTrade(response.data);
        setFormData({
          ticker: '',
          action: 'BUY',
          quantity: '',
          price: '',
          strategy_signal: '',
          user_reasoning: '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create trade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Log New Trade</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticker
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="TSLA"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value as 'BUY' | 'SELL' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="100"
              step="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="250.00"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Strategy Signal
          </label>
          <input
            type="text"
            value={formData.strategy_signal}
            onChange={(e) => setFormData({ ...formData, strategy_signal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="MA crossover + RSI oversold"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Reasoning (Optional)
          </label>
          <textarea
            value={formData.user_reasoning}
            onChange={(e) => setFormData({ ...formData, user_reasoning: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Why did you take or override this trade?"
            rows={3}
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Log Trade
        </button>
      </form>
    </div>
  );
};

