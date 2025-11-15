-- Seed dummy stock data for Ekant (user_1763239376026)
-- 20 different stocks with trades spread over the past 3 months

-- Popular stock tickers
INSERT INTO trades (id, user_id, ticker, action, quantity, price, strategy_signal, user_reasoning, market_context, created_at) VALUES
-- AAPL - Apple
('trade_aapl_1', 'user_1763239376026', 'AAPL', 'BUY', 10, 175.50, 'MA crossover bullish', 'Strong earnings expected', 'Tech sector rally', NOW() - INTERVAL '75 days'),
('trade_aapl_2', 'user_1763239376026', 'AAPL', 'SELL', 10, 182.30, 'RSI overbought', 'Taking profits', 'Market correction', NOW() - INTERVAL '60 days'),

-- MSFT - Microsoft
('trade_msft_1', 'user_1763239376026', 'MSFT', 'BUY', 15, 380.25, 'Breakout above resistance', 'AI growth potential', 'Tech momentum', NOW() - INTERVAL '70 days'),
('trade_msft_2', 'user_1763239376026', 'MSFT', 'BUY', 10, 385.00, 'Dip buying opportunity', 'Strong fundamentals', 'Sector rotation', NOW() - INTERVAL '45 days'),

-- GOOGL - Google
('trade_googl_1', 'user_1763239376026', 'GOOGL', 'BUY', 8, 140.50, 'Oversold bounce', 'Search dominance', 'Ad revenue growth', NOW() - INTERVAL '80 days'),
('trade_googl_2', 'user_1763239376026', 'GOOGL', 'SELL', 8, 145.75, 'Target reached', 'Locking gains', 'Regulatory concerns', NOW() - INTERVAL '50 days'),

-- AMZN - Amazon
('trade_amzn_1', 'user_1763239376026', 'AMZN', 'BUY', 12, 145.20, 'Support level hold', 'AWS growth', 'E-commerce recovery', NOW() - INTERVAL '65 days'),
('trade_amzn_2', 'user_1763239376026', 'AMZN', 'BUY', 15, 142.80, 'Double bottom pattern', 'Value play', 'Market dip', NOW() - INTERVAL '40 days'),

-- TSLA - Tesla
('trade_tsla_1', 'user_1763239376026', 'TSLA', 'BUY', 20, 245.50, 'Momentum breakout', 'EV adoption', 'Production ramp', NOW() - INTERVAL '55 days'),
('trade_tsla_2', 'user_1763239376026', 'TSLA', 'SELL', 20, 238.00, 'Stop loss triggered', 'Volatility risk', 'Market uncertainty', NOW() - INTERVAL '30 days'),

-- META - Meta
('trade_meta_1', 'user_1763239376026', 'META', 'BUY', 25, 320.00, 'Reversal pattern', 'VR investments', 'Ad recovery', NOW() - INTERVAL '72 days'),
('trade_meta_2', 'user_1763239376026', 'META', 'SELL', 25, 335.50, 'Resistance level', 'Profit taking', 'Earnings ahead', NOW() - INTERVAL '48 days'),

-- NVDA - NVIDIA
('trade_nvda_1', 'user_1763239376026', 'NVDA', 'BUY', 5, 485.00, 'AI chip demand', 'Data center growth', 'Tech leadership', NOW() - INTERVAL '68 days'),
('trade_nvda_2', 'user_1763239376026', 'NVDA', 'BUY', 8, 475.50, 'Pullback entry', 'Long term hold', 'Market correction', NOW() - INTERVAL '35 days'),

-- JPM - JPMorgan
('trade_jpm_1', 'user_1763239376026', 'JPM', 'BUY', 30, 155.75, 'Interest rate play', 'Banking strength', 'Economic recovery', NOW() - INTERVAL '58 days'),
('trade_jpm_2', 'user_1763239376026', 'JPM', 'SELL', 30, 162.30, 'Target hit', 'Rate concerns', 'Profit booking', NOW() - INTERVAL '25 days'),

-- V - Visa
('trade_v_1', 'user_1763239376026', 'V', 'BUY', 18, 245.00, 'Payment growth', 'Consumer spending', 'Digital payments', NOW() - INTERVAL '63 days'),
('trade_v_2', 'user_1763239376026', 'V', 'BUY', 20, 240.50, 'Support bounce', 'Strong moat', 'Market dip', NOW() - INTERVAL '38 days'),

-- JNJ - Johnson & Johnson
('trade_jnj_1', 'user_1763239376026', 'JNJ', 'BUY', 22, 165.25, 'Defensive play', 'Dividend yield', 'Market uncertainty', NOW() - INTERVAL '77 days'),
('trade_jnj_2', 'user_1763239376026', 'JNJ', 'SELL', 22, 168.50, 'Slow growth', 'Sector rotation', 'Rebalancing', NOW() - INTERVAL '42 days'),

-- WMT - Walmart
('trade_wmt_1', 'user_1763239376026', 'WMT', 'BUY', 35, 165.00, 'Retail resilience', 'Consumer staples', 'Economic stability', NOW() - INTERVAL '60 days'),
('trade_wmt_2', 'user_1763239376026', 'WMT', 'SELL', 35, 170.25, 'Valuation target', 'Growth concerns', 'Profit taking', NOW() - INTERVAL '28 days'),

-- MA - Mastercard
('trade_ma_1', 'user_1763239376026', 'MA', 'BUY', 15, 420.00, 'Payment network', 'Global expansion', 'Digital shift', NOW() - INTERVAL '66 days'),
('trade_ma_2', 'user_1763239376026', 'MA', 'BUY', 12, 415.50, 'Dip buying', 'Long term growth', 'Market volatility', NOW() - INTERVAL '33 days'),

-- DIS - Disney
('trade_dis_1', 'user_1763239376026', 'DIS', 'BUY', 40, 95.50, 'Streaming recovery', 'Theme park rebound', 'Content strength', NOW() - INTERVAL '74 days'),
('trade_dis_2', 'user_1763239376026', 'DIS', 'SELL', 40, 92.00, 'Stop loss', 'Subscriber concerns', 'Market weakness', NOW() - INTERVAL '52 days'),

-- NFLX - Netflix
('trade_nflx_1', 'user_1763239376026', 'NFLX', 'BUY', 28, 425.00, 'Content investment', 'International growth', 'Streaming leader', NOW() - INTERVAL '69 days'),
('trade_nflx_2', 'user_1763239376026', 'NFLX', 'SELL', 28, 440.50, 'Target reached', 'Competition risk', 'Valuation', NOW() - INTERVAL '36 days'),

-- BAC - Bank of America
('trade_bac_1', 'user_1763239376026', 'BAC', 'BUY', 50, 32.50, 'Banking recovery', 'Interest margins', 'Economic growth', NOW() - INTERVAL '61 days'),
('trade_bac_2', 'user_1763239376026', 'BAC', 'SELL', 50, 34.25, 'Profit target', 'Rate sensitivity', 'Sector rotation', NOW() - INTERVAL '27 days'),

-- XOM - Exxon Mobil
('trade_xom_1', 'user_1763239376026', 'XOM', 'BUY', 45, 115.00, 'Energy cycle', 'Oil prices', 'Dividend play', NOW() - INTERVAL '76 days'),
('trade_xom_2', 'user_1763239376026', 'XOM', 'SELL', 45, 112.50, 'Commodity risk', 'Energy transition', 'Profit taking', NOW() - INTERVAL '44 days'),

-- CVX - Chevron
('trade_cvx_1', 'user_1763239376026', 'CVX', 'BUY', 38, 155.75, 'Energy sector', 'Oil demand', 'Value opportunity', NOW() - INTERVAL '64 days'),
('trade_cvx_2', 'user_1763239376026', 'CVX', 'BUY', 40, 152.00, 'Support level', 'Dividend yield', 'Market dip', NOW() - INTERVAL '31 days'),

-- HD - Home Depot
('trade_hd_1', 'user_1763239376026', 'HD', 'BUY', 20, 345.00, 'Housing market', 'DIY trends', 'Home improvement', NOW() - INTERVAL '71 days'),
('trade_hd_2', 'user_1763239376026', 'HD', 'SELL', 20, 355.50, 'Valuation target', 'Housing slowdown', 'Profit booking', NOW() - INTERVAL '46 days'),

-- PG - Procter & Gamble
('trade_pg_1', 'user_1763239376026', 'PG', 'BUY', 25, 155.25, 'Defensive stock', 'Consumer goods', 'Stability play', NOW() - INTERVAL '78 days'),
('trade_pg_2', 'user_1763239376026', 'PG', 'SELL', 25, 158.75, 'Slow growth', 'Sector rotation', 'Rebalancing', NOW() - INTERVAL '41 days'),

-- KO - Coca-Cola
('trade_ko_1', 'user_1763239376026', 'KO', 'BUY', 60, 58.50, 'Dividend stock', 'Brand strength', 'Defensive play', NOW() - INTERVAL '67 days'),
('trade_ko_2', 'user_1763239376026', 'KO', 'BUY', 55, 57.00, 'Value entry', 'Yield play', 'Market uncertainty', NOW() - INTERVAL '34 days'),

-- PEP - PepsiCo
('trade_pep_1', 'user_1763239376026', 'PEP', 'BUY', 30, 175.00, 'Snack division', 'Diversification', 'Consumer staples', NOW() - INTERVAL '73 days'),
('trade_pep_2', 'user_1763239376026', 'PEP', 'SELL', 30, 180.25, 'Target reached', 'Growth concerns', 'Profit taking', NOW() - INTERVAL '49 days');

-- Verify the insert
SELECT ticker, COUNT(*) as trade_count, MIN(created_at) as first_trade, MAX(created_at) as last_trade
FROM trades
WHERE user_id = 'user_1763239376026'
GROUP BY ticker
ORDER BY ticker;

