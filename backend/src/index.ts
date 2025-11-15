import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { initDatabase, closeDatabase } from './models/db';
import { strategyModel } from './models/strategy';
import { Strategy } from './services/strategy';

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

    // Initialize base strategy if it doesn't exist
    const baseStrategyId = 'strategy_base_001';
    const existingStrategy = await strategyModel.findById(baseStrategyId);
    
    if (!existingStrategy) {
      const baseStrategy: Strategy = {
        id: baseStrategyId,
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
      await strategyModel.create(baseStrategy);
      console.log('✅ Base strategy initialized');
    }

    // Start server
    app.listen(PORT, () => {
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
║  ✓ Raindrop - Infrastructure (coming soon)                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);

      // Log API key status
      console.log('\n📊 API Keys Status:');
      console.log(`  Fastino: ${process.env.FASTINO_API_KEY ? '✅ Configured' : '❌ Missing'}`);
      console.log(`  LinkUp:  ${process.env.LINKUP_API_KEY ? '✅ Configured' : '❌ Missing'}`);
      console.log(`  Raindrop: ${process.env.LM_API_KEY ? '✅ Configured' : '❌ Missing'}`);
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

