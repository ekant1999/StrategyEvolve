import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

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
  console.log('\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

