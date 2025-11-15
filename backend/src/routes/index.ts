import express from 'express';
import { fastinoService } from '../services/fastino';
import { linkUpService } from '../services/linkup';
import { strategyService, Strategy } from '../services/strategy';
import { evolutionService } from '../services/evolution';
import { evolutionServiceV2 } from '../services/evolution_v2';
import { userModel } from '../models/user';
import { strategyModel } from '../models/strategy';
import { tradeModel } from '../models/trade';
import { evolutionModel } from '../models/evolution';
import demoRoutes from './demo';
import quickDemoRoutes from './quickdemo';

const router = express.Router();

// Demo data routes
router.use('/demo', demoRoutes);
router.use('/quickdemo', quickDemoRoutes);

// ============= AUTH & USER ROUTES =============
router.post('/auth/register', async (req, res) => {
  try {
    const { email, name } = req.body;
    const userId = `user_${Date.now()}`;

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Try to register with Fastino (optional - don't fail if this errors)
    let fastinoUserId = null;
    try {
      const fastinoUser = await fastinoService.registerUser(email, userId, name);
      fastinoUserId = fastinoUser.user_id;
      console.log('✅ User registered with Fastino:', userId);
    } catch (fastinoError: any) {
      console.log('⚠️  Fastino registration failed (user still created):', fastinoError.message);
      // Continue without Fastino - user can still use the app
    }

    // Create user in database
    const user = await userModel.create({
      id: userId,
      email,
      name,
      fastino_user_id: fastinoUserId,
      created_at: new Date(),
    });

    console.log('✅ User registered:', userId, email);
    res.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);

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
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get Fastino summary
    try {
      const summary = await fastinoService.getSummary(userId, 500);
      user = await userModel.update(userId, { profile_summary: summary.summary });
    } catch (error) {
      // User might not have enough data yet
      if (!user.profile_summary) {
        user = await userModel.update(userId, { 
          profile_summary: 'No profile data yet. Start trading to build your profile.' 
        });
      }
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= STRATEGY ROUTES =============
router.get('/strategies', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let strategies;
    if (userId) {
      // Return user-specific strategies
      strategies = await strategyModel.findByUser(userId as string);
      console.log(`📊 Fetched ${strategies.length} strategies for user ${userId}`);
    } else {
      // Return all strategies (for admin/debugging)
      strategies = await strategyModel.findAll();
      console.log(`📊 Fetched ${strategies.length} strategies (all users)`);
    }
    
    res.json({ success: true, data: strategies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/strategies/:id', async (req, res) => {
  try {
    const strategy = await strategyModel.findById(req.params.id);

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
    const baseStrat = await strategyModel.findById(baseStrategyId || 'strategy_base_001');

    if (!baseStrat) {
      return res.status(404).json({ success: false, error: 'Base strategy not found' });
    }

    const variants = strategyService.generateVariants(baseStrat, 10);
    for (const variant of variants) {
      await strategyModel.create(variant);
    }

    res.json({ success: true, data: variants });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/strategies/backtest', async (req, res) => {
  try {
    const { strategyId } = req.body;
    const strategy = await strategyModel.findById(strategyId);

    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found' });
    }

    const marketData = strategyService.generateSampleData(252);
    const metrics = strategyService.backtest(strategy, marketData);

    const updatedStrategy = await strategyModel.update(strategyId, { metrics });

    res.json({ success: true, data: updatedStrategy });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= EVOLUTION ROUTES =============
router.post('/evolution/optimize', async (req, res) => {
  try {
    const baseStrat = await strategyModel.findById('strategy_base_001');

    if (!baseStrat) {
      return res.status(404).json({ success: false, error: 'Base strategy not found' });
    }

    const { strategy, event } = await evolutionService.optimizeQuantitative(baseStrat);

    await strategyModel.create(strategy);
    await evolutionModel.create(event);

    res.json({ success: true, data: strategy, event });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/evolution/synthesize', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    console.log(`🚀 Starting V2 evolution with real data for user: ${userId}`);

    // Get user and base strategy
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Try to get user-specific base strategy, fallback to global base strategy
    let baseStrategy = await strategyModel.findBaseByUser(userId);
    if (!baseStrategy) {
      console.log(`⚠️  No user-specific base strategy, using global base strategy`);
      baseStrategy = await strategyModel.findById('strategy_base_001');
    }
    
    if (!baseStrategy) {
      return res.status(404).json({ success: false, error: 'No base strategy found' });
    }

    // Run comprehensive evolution with:
    // - Real stock data from Alpha Vantage/Finnhub
    // - Live sentiment from LinkUp
    // - Behavioral insights from Fastino
    const { strategy: evolvedStrategy, event } = await evolutionServiceV2.optimizeAndEvolveStrategy(
      userId,
      baseStrategy
    );

    console.log(`✅ V2 Evolution complete: Sharpe ${evolvedStrategy.metrics?.sharpe_ratio.toFixed(3)}, Return ${evolvedStrategy.metrics?.total_return.toFixed(2)}%`);

    // Save evolved strategy
    const savedEvolved = await strategyModel.create({
      id: `hybrid_${Date.now()}`,
      user_id: userId,
      name: `Evolved Strategy ${new Date().toISOString()}`,
      type: 'hybrid',
      parameters: evolvedStrategy.parameters,
      metrics: evolvedStrategy.metrics || {},
      created_at: new Date(),
    });

    // Save evolution event
    await evolutionModel.create({
      id: `evolution_${Date.now()}`,
      user_id: userId,
      type: event.type,
      old_strategy_id: baseStrategy.id,
      new_strategy_id: savedEvolved.id,
      improvement: event.improvement,
      insights: event.insights,
      created_at: new Date(),
    });

    res.json({
      success: true,
      data: savedEvolved,
      message: 'Evolution completed successfully with real market data, sentiment analysis, and behavioral insights',
    });
  } catch (error: any) {
    console.error('Evolution synthesis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/evolution/history', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let history;
    if (userId) {
      // Return user-specific evolution history
      history = await evolutionModel.findByUser(userId as string);
      console.log(`📊 Fetched ${history.length} evolution events for user ${userId}`);
    } else {
      // Return all evolution events (for admin/debugging)
      history = await evolutionModel.findAll();
      console.log(`📊 Fetched ${history.length} evolution events (all users)`);
    }
    
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= TRADE ROUTES =============
router.get('/trades', async (req, res) => {
  try {
    const { userId } = req.query;
    let userTrades;

    if (userId && typeof userId === 'string') {
      userTrades = await tradeModel.findByUserId(userId);
    } else {
      userTrades = await tradeModel.findAll();
    }

    console.log(`📊 GET /trades - userId: ${userId}, Total trades: ${userTrades.length}`);

    res.json({ success: true, data: userTrades });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trades', async (req, res) => {
  try {
    const tradeData = req.body;

    // Save trade to database
    const trade = await tradeModel.create(tradeData);

    console.log(`✅ Trade saved: ${trade.id} (${trade.ticker}, ${trade.action})`);

    // Try to ingest into Fastino (optional - don't fail if this errors)
    try {
      await fastinoService.ingestTrade(tradeData.user_id, trade);
      console.log('✅ Trade ingested to Fastino:', trade.id);
    } catch (fastinoError: any) {
      console.log('⚠️  Fastino ingestion failed (trade still saved locally):', fastinoError.message);
    }

    res.json({ success: true, data: trade });
  } catch (error: any) {
    console.error('Trade creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/trades/:id/outcome', async (req, res) => {
  try {
    const trade = await tradeModel.findById(req.params.id);

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

