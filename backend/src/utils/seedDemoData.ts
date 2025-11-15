// Seed demo data for hackathon presentation

export interface DemoTrade {
  ticker: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  strategy_signal: string;
  user_reasoning: string;
  outcome?: {
    exit_price: number;
    return_pct: number;
    duration_days: number;
  };
  days_ago: number;
}

export const demoTrades: DemoTrade[] = [
  // Week 1: User follows strategy mostly
  {
    ticker: 'AAPL',
    action: 'BUY',
    quantity: 50,
    price: 180.50,
    strategy_signal: 'MA crossover bullish, RSI at 28',
    user_reasoning: 'Strategy signal looks good, going in',
    outcome: { exit_price: 185.20, return_pct: 2.6, duration_days: 5 },
    days_ago: 30,
  },
  {
    ticker: 'MSFT',
    action: 'BUY',
    quantity: 40,
    price: 380.00,
    strategy_signal: 'MA crossover bullish, RSI at 32',
    user_reasoning: 'Strong tech sector momentum',
    outcome: { exit_price: 375.50, return_pct: -1.2, duration_days: 7 },
    days_ago: 28,
  },

  // Week 2: User starts showing pattern - aggressive during earnings
  {
    ticker: 'NVDA',
    action: 'BUY',
    quantity: 30,
    price: 490.00,
    strategy_signal: 'MA crossover bullish, RSI at 35',
    user_reasoning: 'Earnings coming up, expecting beat. Strategy is conservative, going bigger.',
    outcome: { exit_price: 518.50, return_pct: 5.8, duration_days: 3 },
    days_ago: 25,
  },
  {
    ticker: 'TSLA',
    action: 'BUY',
    quantity: 80,
    price: 245.00,
    strategy_signal: 'MA crossover bullish, RSI at 29',
    user_reasoning: 'Pre-earnings play, strong delivery numbers leaked',
    outcome: { exit_price: 265.30, return_pct: 8.3, duration_days: 4 },
    days_ago: 23,
  },

  // Week 3: Pattern emerges - user ignores strategy during high volatility
  {
    ticker: 'META',
    action: 'BUY',
    quantity: 25,
    price: 485.00,
    strategy_signal: 'MA crossover bullish, RSI at 31',
    user_reasoning: 'Market volatile today (VIX 32), but going in anyway',
    outcome: { exit_price: 472.50, return_pct: -2.6, duration_days: 8 },
    days_ago: 20,
  },
  {
    ticker: 'AMZN',
    action: 'BUY',
    quantity: 35,
    price: 178.50,
    strategy_signal: 'MA crossover bullish, RSI at 27',
    user_reasoning: 'Strategy says buy, looks good',
    outcome: { exit_price: 183.20, return_pct: 2.6, duration_days: 6 },
    days_ago: 18,
  },

  // Week 4: User reduces size before Fed announcement (learned behavior)
  {
    ticker: 'GOOGL',
    action: 'BUY',
    quantity: 20,
    price: 142.00,
    strategy_signal: 'MA crossover bullish, RSI at 30',
    user_reasoning: 'Fed meeting tomorrow, going light on size',
    outcome: { exit_price: 141.50, return_pct: -0.4, duration_days: 2 },
    days_ago: 15,
  },
  {
    ticker: 'AMD',
    action: 'BUY',
    quantity: 60,
    price: 165.00,
    strategy_signal: 'MA crossover bullish, RSI at 26',
    user_reasoning: 'Post-Fed rally, going bigger',
    outcome: { exit_price: 172.80, return_pct: 4.7, duration_days: 5 },
    days_ago: 13,
  },

  // More trades showing earnings edge
  {
    ticker: 'NFLX',
    action: 'BUY',
    quantity: 45,
    price: 485.00,
    strategy_signal: 'MA crossover bullish, RSI at 33',
    user_reasoning: 'Earnings tonight, subscriber growth looks strong',
    outcome: { exit_price: 505.25, return_pct: 4.2, duration_days: 2 },
    days_ago: 11,
  },
  {
    ticker: 'CRM',
    action: 'BUY',
    quantity: 30,
    price: 268.00,
    strategy_signal: 'MA crossover bullish, RSI at 28',
    user_reasoning: 'AI momentum strong, earnings expected to beat',
    outcome: { exit_price: 281.40, return_pct: 5.0, duration_days: 4 },
    days_ago: 9,
  },

  // Recent trades (no outcomes yet)
  {
    ticker: 'UBER',
    action: 'BUY',
    quantity: 55,
    price: 72.50,
    strategy_signal: 'MA crossover bullish, RSI at 29',
    user_reasoning: 'Strong ridership data, summer travel season',
    days_ago: 3,
  },
  {
    ticker: 'COIN',
    action: 'BUY',
    quantity: 40,
    price: 198.00,
    strategy_signal: 'MA crossover bullish, RSI at 31',
    user_reasoning: 'Bitcoin rally, crypto momentum',
    days_ago: 1,
  },
];

export function getDemoTradesWithDates(userId: string) {
  return demoTrades.map((trade, index) => {
    const created_at = new Date();
    created_at.setDate(created_at.getDate() - trade.days_ago);

    return {
      id: `demo_trade_${index}`,
      user_id: userId,
      ticker: trade.ticker,
      action: trade.action,
      quantity: trade.quantity,
      price: trade.price,
      strategy_signal: trade.strategy_signal,
      user_reasoning: trade.user_reasoning,
      outcome: trade.outcome,
      created_at: created_at.toISOString(),
    };
  });
}

// Identified patterns from demo data (for presentation)
export const expectedPatterns = {
  earnings_edge: {
    description: 'User has 75% win rate during earnings plays vs 50% base strategy',
    examples: ['NVDA (+5.8%)', 'TSLA (+8.3%)', 'NFLX (+4.2%)', 'CRM (+5.0%)'],
  },
  fed_awareness: {
    description: 'User reduces position size by ~50% before Fed announcements',
    examples: ['GOOGL trade: 20 shares vs usual 40-50'],
  },
  volatility_sensitivity: {
    description: 'User tends to trade against high volatility (VIX >30) with poor results',
    examples: ['META (-2.6%) during VIX 32'],
  },
};

