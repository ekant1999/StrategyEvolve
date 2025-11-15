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

