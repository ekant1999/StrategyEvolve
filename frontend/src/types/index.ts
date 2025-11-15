// Core domain types for StrategyEvolve

export interface Strategy {
  id: string;
  name: string;
  type: 'base' | 'optimized' | 'hybrid';
  parameters: StrategyParameters;
  metrics?: StrategyMetrics;
  created_at: Date;
  parent_id?: string;
}

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

export interface Trade {
  id: string;
  user_id: string;
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  strategy_signal: string;
  user_reasoning?: string;
  market_context?: string;
  outcome?: TradeOutcome;
  created_at: Date;
}

export interface TradeOutcome {
  exit_price: number;
  return_pct: number;
  duration_days: number;
}

export interface EvolutionEvent {
  id: string;
  type: 'quantitative' | 'behavioral' | 'hybrid';
  old_strategy_id: string;
  new_strategy_id: string;
  improvement: {
    sharpe_delta: number;
    return_delta: number;
  };
  insights: string;
  created_at: Date;
}

export interface MarketIntelligence {
  ticker: string;
  news: NewsItem[];
  sentiment: string;
  macro_events: MacroEvent[];
  fetched_at: Date;
}

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface MacroEvent {
  event_type: string;
  severity: 'high' | 'medium' | 'low';
  summary: string;
  market_impact: string;
}

export interface UserBehavioralInsight {
  pattern: string;
  confidence: number;
  examples: string[];
  discovered_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  fastino_user_id: string;
  created_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

