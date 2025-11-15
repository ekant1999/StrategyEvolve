// Strategy backtesting and optimization service

export interface StrategyParameters {
  ma_short: number;
  ma_long: number;
  rsi_threshold: number;
  position_size: number;
  stop_loss?: number;
  take_profit?: number;
}

export interface StrategyMetrics {
  sharpe_ratio: number;
  total_return: number;
  max_drawdown: number;
  win_rate: number;
  avg_trade_duration: number;
  num_trades: number;
}

export interface Strategy {
  id: string;
  name: string;
  type: 'base' | 'optimized' | 'hybrid';
  parameters: StrategyParameters;
  metrics?: StrategyMetrics;
  created_at: Date;
  parent_id?: string;
}

export interface MarketData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class StrategyService {
  // Generate strategy variants by varying parameters
  generateVariants(baseStrategy: Strategy, count: number = 10): Strategy[] {
    const variants: Strategy[] = [];

    for (let i = 0; i < count; i++) {
      const variant: Strategy = {
        id: `strategy_${Date.now()}_${i}`,
        name: `${baseStrategy.name} Variant ${i + 1}`,
        type: 'optimized',
        parameters: {
          ma_short: baseStrategy.parameters.ma_short + (Math.random() * 10 - 5),
          ma_long: baseStrategy.parameters.ma_long + (Math.random() * 20 - 10),
          rsi_threshold: baseStrategy.parameters.rsi_threshold + (Math.random() * 10 - 5),
          position_size: baseStrategy.parameters.position_size * (0.8 + Math.random() * 0.4),
        },
        created_at: new Date(),
        parent_id: baseStrategy.id,
      };

      variants.push(variant);
    }

    return variants;
  }

  // Backtest a strategy on historical data
  backtest(strategy: Strategy, marketData: MarketData[]): StrategyMetrics {
    let capital = 100000; // Starting capital
    let position = 0;
    let trades: any[] = [];
    let equity_curve: number[] = [capital];

    // Calculate moving averages and RSI
    const ma_short = this.calculateMA(marketData, strategy.parameters.ma_short);
    const ma_long = this.calculateMA(marketData, strategy.parameters.ma_long);
    const rsi = this.calculateRSI(marketData, 14);

    for (let i = Math.max(strategy.parameters.ma_long, 14); i < marketData.length; i++) {
      const price = marketData[i].close;

      // Generate signals
      const bullish = ma_short[i] > ma_long[i] && rsi[i] < (100 - strategy.parameters.rsi_threshold);
      const bearish = ma_short[i] < ma_long[i] || rsi[i] > strategy.parameters.rsi_threshold;

      // Execute trades
      if (bullish && position === 0) {
        // Buy
        position = (capital * strategy.parameters.position_size) / price;
        capital -= position * price;
        trades.push({
          type: 'BUY',
          date: marketData[i].date,
          price,
          quantity: position,
        });
      } else if (bearish && position > 0) {
        // Sell
        capital += position * price;
        trades.push({
          type: 'SELL',
          date: marketData[i].date,
          price,
          quantity: position,
        });
        position = 0;
      }

      // Update equity curve
      const current_equity = capital + position * price;
      equity_curve.push(current_equity);
    }

    // Calculate final equity
    if (position > 0) {
      capital += position * marketData[marketData.length - 1].close;
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(equity_curve, trades);

    return metrics;
  }

  private calculateMA(data: MarketData[], period: number): number[] {
    const ma: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ma.push(0);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += data[i - j].close;
        }
        ma.push(sum / period);
      }
    }

    return ma;
  }

  private calculateRSI(data: MarketData[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = 0; i < gains.length; i++) {
      if (i < period) {
        rsi.push(50); // Neutral RSI for early values
      } else {
        const avg_gain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
        const avg_loss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

        if (avg_loss === 0) {
          rsi.push(100);
        } else {
          const rs = avg_gain / avg_loss;
          rsi.push(100 - 100 / (1 + rs));
        }
      }
    }

    return [50, ...rsi]; // Add initial value
  }

  private calculateMetrics(equity_curve: number[], trades: any[]): StrategyMetrics {
    const initial_capital = equity_curve[0];
    const final_capital = equity_curve[equity_curve.length - 1];

    // Total return
    const total_return = ((final_capital - initial_capital) / initial_capital) * 100;

    // Calculate returns for Sharpe ratio
    const returns: number[] = [];
    for (let i = 1; i < equity_curve.length; i++) {
      const daily_return = (equity_curve[i] - equity_curve[i - 1]) / equity_curve[i - 1];
      returns.push(daily_return);
    }

    const avg_return = returns.reduce((a, b) => a + b, 0) / returns.length;
    const std_return = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avg_return, 2), 0) / returns.length
    );

    const sharpe_ratio = std_return > 0 ? (avg_return / std_return) * Math.sqrt(252) : 0;

    // Max drawdown
    let max_drawdown = 0;
    let peak = equity_curve[0];

    for (const equity of equity_curve) {
      if (equity > peak) {
        peak = equity;
      }
      const drawdown = ((peak - equity) / peak) * 100;
      if (drawdown > max_drawdown) {
        max_drawdown = drawdown;
      }
    }

    // Win rate
    let wins = 0;
    let completed_trades = 0;

    for (let i = 0; i < trades.length - 1; i += 2) {
      if (trades[i].type === 'BUY' && trades[i + 1] && trades[i + 1].type === 'SELL') {
        completed_trades++;
        if (trades[i + 1].price > trades[i].price) {
          wins++;
        }
      }
    }

    const win_rate = completed_trades > 0 ? (wins / completed_trades) * 100 : 0;

    // Average trade duration
    let total_duration = 0;
    let duration_count = 0;

    for (let i = 0; i < trades.length - 1; i += 2) {
      if (trades[i].type === 'BUY' && trades[i + 1] && trades[i + 1].type === 'SELL') {
        const duration = (trades[i + 1].date.getTime() - trades[i].date.getTime()) / (1000 * 60 * 60 * 24);
        total_duration += duration;
        duration_count++;
      }
    }

    const avg_trade_duration = duration_count > 0 ? total_duration / duration_count : 0;

    return {
      sharpe_ratio,
      total_return,
      max_drawdown: -max_drawdown,
      win_rate,
      avg_trade_duration,
      num_trades: completed_trades,
    };
  }

  // Generate sample historical market data
  generateSampleData(days: number = 252): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Simple random walk with trend
      const change = (Math.random() - 0.48) * 3; // Slight upward bias
      price = Math.max(price + change, 10); // Don't go below 10

      const open = price;
      const high = price + Math.random() * 2;
      const low = price - Math.random() * 2;
      const close = low + Math.random() * (high - low);
      const volume = Math.floor(1000000 + Math.random() * 5000000);

      data.push({ date, open, high, low, close, volume });
    }

    return data;
  }
}

export const strategyService = new StrategyService();

