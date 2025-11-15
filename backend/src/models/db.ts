import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'strategy_evolve',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Initialize database schema
export const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema...');

    // Create tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        fastino_user_id VARCHAR(255),
        profile_summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS strategies (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        parameters JSONB NOT NULL,
        metrics JSONB,
        parent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES strategies(id) ON DELETE SET NULL
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS trades (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        ticker VARCHAR(10) NOT NULL,
        action VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        strategy_signal TEXT,
        user_reasoning TEXT,
        market_context TEXT,
        outcome JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS evolution_events (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        old_strategy_id VARCHAR(255) NOT NULL,
        new_strategy_id VARCHAR(255) NOT NULL,
        improvement JSONB NOT NULL,
        insights TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (old_strategy_id) REFERENCES strategies(id) ON DELETE CASCADE,
        FOREIGN KEY (new_strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_evolution_events_created_at ON evolution_events(created_at DESC);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_strategies_type ON strategies(type);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Close all connections (useful for graceful shutdown)
export const closeDatabase = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export default pool;

