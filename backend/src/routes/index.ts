import express from 'express';
import { fastinoService } from '../services/fastino';
import { linkUpService } from '../services/linkup';
import { strategyService, Strategy } from '../services/strategy';
import { evolutionService } from '../services/evolution';
import demoRoutes from './demo';
import quickDemoRoutes from './quickdemo';

const router = express.Router();

// Demo data routes
router.use('/demo', demoRoutes);
router.use('/quickdemo', quickDemoRoutes);

// In-memory storage (replace with database in production)
const users: Map<string, any> = new Map();
const strategies: Map<string, Strategy> = new Map();
const trades: Map<string, any> = new Map();
const evolutionEvents: Map<string, any> = new Map();

// Initialize base strategy
const baseStrategy: Strategy = {
  id: 'strategy_base_001',
  name: 'MA Crossover + RSI',
  type: 'base',
  parameters: {
    ma_short: 20,
    ma_long: 50,
    rsi_threshold: 30,
    position_size: 0.1,
  },
  metrics: {
    sharpe_ratio: 0.8,
    total_return: 12.5,
    max_drawdown: -18.2,
    win_rate: 54.3,
    avg_trade_duration: 12.5,
    num_trades: 45,
  },
  created_at: new Date(),
};

strategies.set(baseStrategy.id, baseStrategy);

// ============= AUTH & USER ROUTES =============
router.post('/auth/register', async (req, res) => {
  try {
    const { email, name } = req.body;
    const userId = `user_${Date.now()}`;

    // Register with Fastino
    const fastinoUser = await fastinoService.registerUser(email, userId, name);

    const user = {
      id: userId,
      email,
      name,
      fastino_user_id: fastinoUser.user_id,
      created_at: new Date(),
    };

    users.set(userId, user);

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = Array.from(users.values()).find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get Fastino summary
    try {
      const summary = await fastinoService.getSummary(userId, 500);
      user.profile_summary = summary.summary;
    } catch (error) {
      // User might not have enough data yet
      user.profile_summary = 'No profile data yet. Start trading to build your profile.';
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= STRATEGY ROUTES =============
router.get('/strategies', async (req, res) => {
  try {
    const allStrategies = Array.from(strategies.values());
    res.json({ success: true, data: allStrategies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/strategies/:id', async (req, res) => {
  try {
    const strategy = strategies.get(req.params.id);

    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found' });
    }

    res.json({ success: true, data: strategy });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/strategies/generate', async (req, res) => {
  try {
    const { baseStrategyId } = req.body;
    const baseStrat = strategies.get(baseStrategyId || 'strategy_base_001');

    if (!baseStrat) {
      return res.status(404).json({ success: false, error: 'Base strategy not found' });
    }

    const variants = strategyService.generateVariants(baseStrat, 10);
    variants.forEach((v) => strategies.set(v.id, v));

    res.json({ success: true, data: variants });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/strategies/backtest', async (req, res) => {
  try {
    const { strategyId } = req.body;
    const strategy = strategies.get(strategyId);

    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found' });
    }

    const marketData = strategyService.generateSampleData(252);
    const metrics = strategyService.backtest(strategy, marketData);

    strategy.metrics = metrics;
    strategies.set(strategy.id, strategy);

    res.json({ success: true, data: strategy });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= EVOLUTION ROUTES =============
router.post('/evolution/optimize', async (req, res) => {
  try {
    const baseStrat = strategies.get('strategy_base_001');

    if (!baseStrat) {
      return res.status(404).json({ success: false, error: 'Base strategy not found' });
    }

    const { strategy, event } = await evolutionService.optimizeQuantitative(baseStrat);

    strategies.set(strategy.id, strategy);
    evolutionEvents.set(event.id, event);

    res.json({ success: true, data: strategy, event });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/evolution/synthesize', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // For demo: Create a mock evolved strategy with improved metrics
    const evolvedStrategy = {
      id: `strategy_evolved_${Date.now()}`,
      name: 'Hybrid Evolved Strategy',
      type: 'hybrid' as const,
      parameters: {
        ma_short: 18,
        ma_long: 48,
        rsi_threshold: 27,
        position_size: 0.12,
      },
      metrics: {
        sharpe_ratio: 1.62,
        total_return: 19.8,
        max_drawdown: -12.5,
        win_rate: 68.7,
        avg_trade_duration: 10.2,
        num_trades: 52,
      },
      created_at: new Date(),
      parent_id: 'strategy_base_001',
    };

    const evolutionEvent = {
      id: `evolution_${Date.now()}`,
      type: 'hybrid' as const,
      old_strategy_id: 'strategy_base_001',
      new_strategy_id: evolvedStrategy.id,
      improvement: {
        sharpe_delta: 0.82,
        return_delta: 7.3,
      },
      insights: `Hybrid strategy evolved through three loops:
        
1. Quantitative Optimization: Optimized MA periods (20/50 → 18/48) and RSI threshold (30 → 27), improving Sharpe by +0.35

2. Behavioral Learning (Fastino): Discovered user has 75% win rate during earnings plays vs 50% base strategy. User reduces position size 50% before Fed announcements.

3. Market Context (LinkUp): Current market shows low volatility (VIX 18), bullish momentum in tech sector. Optimal conditions for increased position sizing.

Result: Combined improvements yield Sharpe 1.62 (+102%), Return 19.8% (+58%)`,
      created_at: new Date(),
    };

    // Save to storage
    strategies.set(evolvedStrategy.id, evolvedStrategy);
    evolutionEvents.set(evolutionEvent.id, evolutionEvent);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({ 
      success: true, 
      data: evolvedStrategy, 
      events: [evolutionEvent]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/evolution/history', async (req, res) => {
  try {
    const history = Array.from(evolutionEvents.values()).sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= TRADE ROUTES =============
router.get('/trades', async (req, res) => {
  try {
    const { userId } = req.query;
    let userTrades = Array.from(trades.values());

    if (userId) {
      userTrades = userTrades.filter((t) => t.user_id === userId);
    }

    res.json({ success: true, data: userTrades });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trades', async (req, res) => {
  try {
    const tradeData = req.body;
    const tradeId = `trade_${Date.now()}`;

    const trade = {
      id: tradeId,
      ...tradeData,
      created_at: new Date(),
    };

    // Save trade to in-memory store
    trades.set(tradeId, trade);

    // Try to ingest into Fastino (optional - don't fail if this errors)
    try {
      await fastinoService.ingestTrade(tradeData.user_id, trade);
      console.log('✅ Trade ingested to Fastino:', tradeId);
    } catch (fastinoError: any) {
      console.log('⚠️  Fastino ingestion failed (trade still saved locally):', fastinoError.message);
    }

    res.json({ success: true, data: trade });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trades/:id/outcome', async (req, res) => {
  try {
    const trade = trades.get(req.params.id);

    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    res.json({ success: true, data: trade });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= MARKET INTELLIGENCE ROUTES =============
router.post('/market/news', async (req, res) => {
  try {
    const { ticker, days = 7 } = req.body;
    const news = await linkUpService.getTickerNews(ticker, days);

    res.json({ success: true, data: { ticker, news } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/market/sentiment', async (req, res) => {
  try {
    const { ticker } = req.body;
    const sentiment = await linkUpService.getSentiment(ticker);

    res.json({ success: true, data: { ticker, sentiment } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/market/macro', async (req, res) => {
  try {
    const macroEvents = await linkUpService.getMacroEvents();

    res.json({ success: true, data: macroEvents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= INSIGHTS ROUTES =============
router.post('/insights/query', async (req, res) => {
  try {
    const { userId, question } = req.body;
    const result = await fastinoService.queryBehavior(userId, question);

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/insights/chunks', async (req, res) => {
  try {
    const { userId, context } = req.body;
    const history = [{ role: 'user', content: context }];
    const chunks = await fastinoService.getChunks(userId, history);

    res.json({ success: true, data: chunks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

