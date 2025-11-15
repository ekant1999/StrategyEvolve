-- First, ensure the user exists (if not already created)
INSERT INTO users (id, email, name, created_at)
VALUES ('user_prathamesh', 'prathamesh@example.com', 'Prathamesh', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert 25 diverse trades for Prathamesh across different stocks
INSERT INTO trades (id, user_id, ticker, action, quantity, price, strategy_signal, user_reasoning, market_context, created_at) VALUES

-- AAPL trades
('trade_prathamesh_1', 'user_prathamesh', 'AAPL', 'BUY', 50, 178.50, 'RSI oversold', 'Strong earnings expected', 'Market dip opportunity', NOW() - INTERVAL '90 days'),
('trade_prathamesh_2', 'user_prathamesh', 'AAPL', 'SELL', 50, 185.20, 'Take profit', 'Hit target price', 'Market rally', NOW() - INTERVAL '75 days'),
('trade_prathamesh_3', 'user_prathamesh', 'AAPL', 'BUY', 30, 182.00, 'MA crossover', 'Technical breakout', 'Bullish trend', NOW() - INTERVAL '45 days'),

-- GOOGL trades
('trade_prathamesh_4', 'user_prathamesh', 'GOOGL', 'BUY', 25, 138.75, 'Support level', 'AI initiatives positive', 'Tech sector strong', NOW() - INTERVAL '85 days'),
('trade_prathamesh_5', 'user_prathamesh', 'GOOGL', 'SELL', 25, 145.30, 'Resistance hit', 'Short-term profit taking', 'Market consolidation', NOW() - INTERVAL '70 days'),
('trade_prathamesh_6', 'user_prathamesh', 'GOOGL', 'BUY', 40, 141.20, 'Breakout signal', 'Cloud growth accelerating', 'Positive sentiment', NOW() - INTERVAL '50 days'),

-- MSFT trades
('trade_prathamesh_7', 'user_prathamesh', 'MSFT', 'BUY', 35, 365.00, 'Trend following', 'Azure strong growth', 'Enterprise adoption', NOW() - INTERVAL '88 days'),
('trade_prathamesh_8', 'user_prathamesh', 'MSFT', 'SELL', 35, 378.50, 'Target reached', 'Profit booking', 'Market at highs', NOW() - INTERVAL '65 days'),
('trade_prathamesh_9', 'user_prathamesh', 'MSFT', 'BUY', 20, 370.25, 'Dip buying', 'Long-term hold', 'AI integration positive', NOW() - INTERVAL '40 days'),

-- TSLA trades
('trade_prathamesh_10', 'user_prathamesh', 'TSLA', 'BUY', 15, 242.00, 'Momentum trade', 'Production numbers good', 'EV sector bullish', NOW() - INTERVAL '82 days'),
('trade_prathamesh_11', 'user_prathamesh', 'TSLA', 'SELL', 15, 255.80, 'Quick profit', 'Volatility concern', 'Taking chips off table', NOW() - INTERVAL '68 days'),
('trade_prathamesh_12', 'user_prathamesh', 'TSLA', 'BUY', 25, 248.50, 'Swing trade', 'Delivery numbers beat', 'Market optimism', NOW() - INTERVAL '35 days'),

-- NVDA trades
('trade_prathamesh_13', 'user_prathamesh', 'NVDA', 'BUY', 20, 485.00, 'AI play', 'GPU demand strong', 'Data center growth', NOW() - INTERVAL '80 days'),
('trade_prathamesh_14', 'user_prathamesh', 'NVDA', 'SELL', 10, 512.30, 'Partial profit', 'Securing gains', 'Overbought territory', NOW() - INTERVAL '60 days'),
('trade_prathamesh_15', 'user_prathamesh', 'NVDA', 'BUY', 15, 498.75, 'Add to position', 'Pullback opportunity', 'Long-term bullish', NOW() - INTERVAL '30 days'),

-- AMZN trades
('trade_prathamesh_16', 'user_prathamesh', 'AMZN', 'BUY', 30, 152.50, 'Value opportunity', 'AWS margins improving', 'E-commerce recovery', NOW() - INTERVAL '78 days'),
('trade_prathamesh_17', 'user_prathamesh', 'AMZN', 'SELL', 30, 162.80, 'Resistance zone', 'Profit target met', 'Market uncertainty', NOW() - INTERVAL '55 days'),

-- META trades
('trade_prathamesh_18', 'user_prathamesh', 'META', 'BUY', 25, 325.00, 'Breakout buy', 'Ad revenue strong', 'User growth positive', NOW() - INTERVAL '72 days'),
('trade_prathamesh_19', 'user_prathamesh', 'META', 'SELL', 25, 342.50, 'Profit taking', 'Hit price target', 'Lock in gains', NOW() - INTERVAL '48 days'),

-- AMD trades
('trade_prathamesh_20', 'user_prathamesh', 'AMD', 'BUY', 45, 125.00, 'Chip sector play', 'Server chip demand', 'Tech rebound', NOW() - INTERVAL '66 days'),
('trade_prathamesh_21', 'user_prathamesh', 'AMD', 'SELL', 45, 132.75, 'Short-term trade', 'Quick profit secured', 'Sector rotation', NOW() - INTERVAL '52 days'),

-- NFLX trades
('trade_prathamesh_22', 'user_prathamesh', 'NFLX', 'BUY', 20, 425.00, 'Streaming play', 'Subscriber growth up', 'Content strength', NOW() - INTERVAL '62 days'),
('trade_prathamesh_23', 'user_prathamesh', 'NFLX', 'SELL', 20, 445.60, 'Target achieved', 'Risk management', 'Taking profits', NOW() - INTERVAL '42 days'),

-- Recent trades
('trade_prathamesh_24', 'user_prathamesh', 'GOOGL', 'BUY', 35, 143.80, 'Recent entry', 'Earnings catalyst', 'Positive outlook', NOW() - INTERVAL '15 days'),
('trade_prathamesh_25', 'user_prathamesh', 'AAPL', 'BUY', 40, 186.50, 'Recent position', 'iPhone cycle strong', 'Services growth', NOW() - INTERVAL '8 days')

ON CONFLICT (id) DO NOTHING;
