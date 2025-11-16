import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { initDatabase, closeDatabase } from './models/db';
import { strategyModel } from './models/strategy';
import { Strategy } from './services/strategy';
import { raindropService } from './services/raindrop';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'StrategyEvolve API',
    version: '1.0.0',
    description: 'Self-Optimizing Trading Strategy Agent Backend',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database schema
    await initDatabase();

    // Initialize Raindrop SmartSQL if available
    if (raindropService.isAvailable()) {
      try {
        console.log('🌧️  Initializing Raindrop SmartSQL database...');
        await raindropService.initializeDatabase();
        console.log('✅ Raindrop SmartSQL initialized successfully');
      } catch (error) {
        console.warn('⚠️  Raindrop SmartSQL initialization failed, using local database:', error);
      }
    }

    // Initialize base strategy if it doesn't exist
    const baseStrategyId = 'strategy_base_001';
    const existingStrategy = await strategyModel.findById(baseStrategyId);
    
    if (!existingStrategy) {
      const baseStrategy: Strategy = {
        id: baseStrategyId,
        name: 'MA Crossover + RSI (High Return)',
        type: 'base',
        parameters: {
          ma_short: 15,  // Faster signals (was 20)
          ma_long: 40,   // Faster trend detection (was 50)
          rsi_threshold: 30,
          position_size: 0.15,  // 15% position size (was 10%)
        },
        metrics: {
          sharpe_ratio: 1.2,
          total_return: 18.5,  // Higher expected return
          max_drawdown: -8.5,
          win_rate: 58.0,
          avg_trade_duration: 5.5,  // Longer holds
          num_trades: 45,
        },
        created_at: new Date(),
      };
      await strategyModel.create(baseStrategy);
      console.log('✅ Base strategy initialized with HIGH RETURN parameters');
    }

    // Start server
    app.listen(PORT, async () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🚀 StrategyEvolve Backend Server 🚀              ║
║                                                            ║
║  Server running on: http://localhost:${PORT}                 ║
║  Environment: ${process.env.NODE_ENV || 'development'.padEnd(42)}║
║                                                            ║
║  Integrated Services:                                      ║
║  ✓ PostgreSQL Database                                    ║
║  ✓ Fastino AI - Behavioral Learning                       ║
║  ✓ LinkUp - Market Intelligence                           ║
║  ✓ Raindrop - Parallel Tasks & SmartSQL                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);

      // Log API key status
      console.log('\n📊 API Keys Status:');
      console.log(`  Fastino: ${process.env.FASTINO_API_KEY ? '✅ Configured' : '❌ Missing'}`);
      console.log(`  LinkUp:  ${process.env.LINKUP_API_KEY ? '✅ Configured' : '❌ Missing'}`);
      console.log(`  Raindrop: ${process.env.LM_API_KEY ? '✅ Configured' : '❌ Missing'}`);
      
      // Check Raindrop health
      if (raindropService.isAvailable()) {
        const health = await raindropService.healthCheck();
        console.log(`    └─ Status: ${health.available ? '🟢 Healthy' : '🔴 Unavailable'}`);
        console.log(`    └─ Features: Tasks, Queues, SmartSQL, Observers`);
      }
      
      console.log('\n📊 Database Status:');
      console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
      console.log(`  Database: ${process.env.DB_NAME || 'strategy_evolve'}`);
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

