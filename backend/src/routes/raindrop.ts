import { Router, Request, Response } from 'express';
import { raindropService } from '../services/raindrop';
import { strategyService } from '../services/strategy';

const router = Router();

/**
 * GET /api/raindrop/status
 * Check Raindrop service status and availability
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const info = raindropService.getInfo();
    
    if (!info.enabled) {
      return res.json({
        enabled: false,
        message: 'Raindrop is not configured. Set LM_API_KEY environment variable to enable.',
        info,
      });
    }

    const health = await raindropService.healthCheck();

    res.json({
      enabled: true,
      available: health.available,
      status: health.status,
      info,
      features: {
        tasks: 'Parallel task execution',
        queues: 'Distributed workload management',
        smartsql: 'PostgreSQL database operations',
        observers: 'Automated monitoring and triggers',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to check Raindrop status',
      message: error.message,
    });
  }
});

/**
 * POST /api/raindrop/demo/parallel-backtest
 * Demonstrate parallel backtesting using Raindrop Tasks
 */
router.post('/demo/parallel-backtest', async (req: Request, res: Response) => {
  try {
    if (!raindropService.isAvailable()) {
      return res.status(400).json({
        error: 'Raindrop not configured',
        message: 'Set LM_API_KEY to enable Raindrop features',
      });
    }

    console.log('\n🌧️  Starting Raindrop parallel backtest demo...\n');

    // Create base strategy
    const baseStrategy = {
      id: 'demo_strategy',
      name: 'MA Crossover Demo',
      type: 'base',
      parameters: {
        ma_short: 20,
        ma_long: 50,
        rsi_threshold: 30,
        position_size: 0.1,
      },
    };

    // Generate variants
    const variants = strategyService.generateVariants(baseStrategy, 10);
    console.log(`📊 Generated ${variants.length} strategy variants`);

    // Generate sample market data
    const marketData = strategyService.generateSampleData(252);
    console.log(`📊 Generated 252 days of market data`);

    // Prepare backtest tasks
    const backtestTasks = variants.map(variant => ({
      strategy: variant,
      marketData,
      ticker: 'DEMO',
    }));

    const startTime = Date.now();

    // Run parallel backtests via Raindrop
    console.log('🌧️  Submitting tasks to Raindrop...');
    const results = await raindropService.runParallelBacktests(backtestTasks);

    const duration = Date.now() - startTime;

    // Find best result
    const bestResult = results.reduce((best, current) => {
      return current.sharpe > best.sharpe ? current : best;
    }, results[0]);

    console.log(`✅ Parallel backtest completed in ${duration}ms`);

    res.json({
      success: true,
      message: 'Parallel backtest completed successfully',
      stats: {
        total_variants: variants.length,
        duration_ms: duration,
        avg_time_per_variant: Math.round(duration / variants.length),
      },
      best_strategy: {
        parameters: bestResult.strategy.parameters,
        metrics: {
          sharpe_ratio: bestResult.sharpe,
          total_return: bestResult.totalReturn,
          win_rate: bestResult.winRate,
          max_drawdown: bestResult.maxDrawdown,
          trades: bestResult.trades,
        },
      },
      all_results: results.map(r => ({
        sharpe: r.sharpe,
        return: r.totalReturn,
        trades: r.trades,
      })),
    });
  } catch (error: any) {
    console.error('Parallel backtest demo failed:', error);
    res.status(500).json({
      error: 'Parallel backtest failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/raindrop/demo/create-task
 * Demonstrate creating a Raindrop task
 */
router.post('/demo/create-task', async (req: Request, res: Response) => {
  try {
    if (!raindropService.isAvailable()) {
      return res.status(400).json({
        error: 'Raindrop not configured',
      });
    }

    const { taskType, payload } = req.body;

    const task = await raindropService.createTask(taskType || 'demo', payload || {
      message: 'Demo task from StrategyEvolve',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to create task',
      message: error.message,
    });
  }
});

/**
 * GET /api/raindrop/demo/task/:taskId
 * Get task status
 */
router.get('/demo/task/:taskId', async (req: Request, res: Response) => {
  try {
    if (!raindropService.isAvailable()) {
      return res.status(400).json({
        error: 'Raindrop not configured',
      });
    }

    const { taskId } = req.params;
    const task = await raindropService.getTask(taskId);

    res.json({
      success: true,
      task,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get task',
      message: error.message,
    });
  }
});

/**
 * POST /api/raindrop/demo/smartsql
 * Demonstrate SmartSQL query execution
 */
router.post('/demo/smartsql', async (req: Request, res: Response) => {
  try {
    if (!raindropService.isAvailable()) {
      return res.status(400).json({
        error: 'Raindrop SmartSQL not configured',
      });
    }

    const { query, params } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
      });
    }

    console.log('🌧️  Executing SmartSQL query:', query);
    const result = await raindropService.executeSQL(query, params);

    res.json({
      success: true,
      message: 'Query executed successfully',
      result: {
        rows: result.rows,
        rowCount: result.rowCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'SmartSQL query failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/raindrop/demo/observer
 * Create a demo observer
 */
router.post('/demo/observer', async (req: Request, res: Response) => {
  try {
    if (!raindropService.isAvailable()) {
      return res.status(400).json({
        error: 'Raindrop not configured',
      });
    }

    const { name, entityType, callbackUrl } = req.body;

    const observer = await raindropService.createObserver(
      name || 'demo_observer',
      entityType || 'demo_entity',
      callbackUrl
    );

    res.json({
      success: true,
      message: 'Observer created successfully',
      observer,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to create observer',
      message: error.message,
    });
  }
});

/**
 * GET /api/raindrop/demo/examples
 * Get usage examples for Raindrop features
 */
router.get('/demo/examples', (req: Request, res: Response) => {
  res.json({
    message: 'Raindrop Integration Examples',
    features: {
      tasks: {
        description: 'Parallel task execution for CPU-intensive operations',
        example: 'POST /api/raindrop/demo/parallel-backtest',
        use_case: 'Run 10+ backtest variants simultaneously',
      },
      queues: {
        description: 'Distributed workload management with retry policies',
        example: 'POST /api/raindrop/demo/create-queue',
        use_case: 'Process evolution requests with automatic retries',
      },
      smartsql: {
        description: 'PostgreSQL database operations via API',
        example: 'POST /api/raindrop/demo/smartsql',
        use_case: 'Persistent storage for trades and strategies',
      },
      observers: {
        description: 'Automated monitoring and event-driven triggers',
        example: 'POST /api/raindrop/demo/observer',
        use_case: 'Auto-trigger evolution when trade outcomes update',
      },
    },
    quick_test: {
      curl: `curl -X GET http://localhost:3001/api/raindrop/status`,
      description: 'Check if Raindrop is configured and healthy',
    },
  });
});

export default router;

