import axios, { AxiosInstance } from 'axios';

const RAINDROP_API_URL = 'https://api.liquidmetal.ai/v1';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RaindropTask {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface RaindropQueue {
  queue_id: string;
  name: string;
  tasks: number;
  status: 'active' | 'paused';
}

export interface BacktestTask {
  strategy: any;
  marketData: any[];
  ticker: string;
}

export interface BacktestResult {
  sharpe: number;
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  trades: number;
  strategy: any;
}

export interface SmartSQLQuery {
  query: string;
  params?: any[];
}

export interface SmartSQLResult {
  rows: any[];
  rowCount: number;
}

export interface Observer {
  observer_id: string;
  name: string;
  entity_type: string;
  callback_url?: string;
  status: 'active' | 'inactive';
}

// ============================================================================
// RAINDROP SERVICE
// ============================================================================

class RaindropService {
  private client: AxiosInstance;
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = process.env.LM_API_KEY || '';
    this.isEnabled = !!this.apiKey;
    
    this.client = axios.create({
      baseURL: RAINDROP_API_URL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  isAvailable(): boolean {
    return this.isEnabled;
  }

  // ============================================================================
  // TASKS API - For parallel backtesting
  // ============================================================================

  /**
   * Create a new task for parallel backtesting
   * @param taskType Type of task (e.g., 'backtest')
   * @param payload Task data
   */
  async createTask(taskType: string, payload: any): Promise<RaindropTask> {
    if (!this.isEnabled) {
      throw new Error('Raindrop is not configured. Set LM_API_KEY environment variable.');
    }

    try {
      const response = await this.client.post('/tasks', {
        task_type: taskType,
        payload,
        priority: 'normal',
      });

      console.log(`🌧️  Created Raindrop task: ${response.data.task_id}`);
      return response.data;
    } catch (error: any) {
      console.error('Raindrop create task error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get task status and result
   * @param taskId Task ID
   */
  async getTask(taskId: string): Promise<RaindropTask> {
    if (!this.isEnabled) {
      throw new Error('Raindrop is not configured.');
    }

    try {
      const response = await this.client.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      console.error('Raindrop get task error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Wait for task completion (polling)
   * @param taskId Task ID
   * @param maxWaitMs Maximum wait time in milliseconds
   */
  async waitForTask(taskId: string, maxWaitMs: number = 60000): Promise<RaindropTask> {
    const startTime = Date.now();
    const pollInterval = 1000; // 1 second

    while (Date.now() - startTime < maxWaitMs) {
      const task = await this.getTask(taskId);
      
      if (task.status === 'completed') {
        console.log(`✅ Task ${taskId} completed successfully`);
        return task;
      }
      
      if (task.status === 'failed') {
        throw new Error(`Task ${taskId} failed: ${task.error}`);
      }

      // Still running, wait and poll again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Task ${taskId} timeout after ${maxWaitMs}ms`);
  }

  /**
   * Run multiple backtest tasks in parallel
   * @param backtestTasks Array of backtest configurations
   */
  async runParallelBacktests(backtestTasks: BacktestTask[]): Promise<BacktestResult[]> {
    if (!this.isEnabled) {
      console.warn('⚠️  Raindrop not configured. Running backtests sequentially instead.');
      // Fallback to sequential processing
      return this.runSequentialBacktests(backtestTasks);
    }

    console.log(`🌧️  Starting ${backtestTasks.length} parallel backtests via Raindrop...`);

    try {
      // Create all tasks
      const taskPromises = backtestTasks.map(task =>
        this.createTask('backtest', task)
      );

      const createdTasks = await Promise.all(taskPromises);
      console.log(`🌧️  Created ${createdTasks.length} tasks`);

      // Wait for all tasks to complete
      const completedTasks = await Promise.all(
        createdTasks.map(task => this.waitForTask(task.task_id))
      );

      // Extract results
      const results = completedTasks.map(task => task.result as BacktestResult);
      console.log(`✅ All ${results.length} backtests completed`);

      return results;
    } catch (error) {
      console.error('Parallel backtest error:', error);
      // Fallback to sequential
      return this.runSequentialBacktests(backtestTasks);
    }
  }

  /**
   * Fallback: Run backtests sequentially (used when Raindrop unavailable)
   */
  private async runSequentialBacktests(backtestTasks: BacktestTask[]): Promise<BacktestResult[]> {
    // Import backtesting logic
    const { strategyService } = await import('./strategy');
    
    const results: BacktestResult[] = [];
    
    for (const task of backtestTasks) {
      const metrics = strategyService.backtest(task.strategy, task.marketData);
      results.push({
        sharpe: metrics.sharpe_ratio,
        totalReturn: metrics.total_return,
        winRate: metrics.win_rate,
        maxDrawdown: metrics.max_drawdown,
        trades: metrics.num_trades,
        strategy: task.strategy,
      });
    }
    
    return results;
  }

  // ============================================================================
  // QUEUES API - For managing task queues
  // ============================================================================

  /**
   * Create a new queue for task management
   * @param queueName Queue name
   */
  async createQueue(queueName: string): Promise<RaindropQueue> {
    if (!this.isEnabled) {
      throw new Error('Raindrop is not configured.');
    }

    try {
      const response = await this.client.post('/queues', {
        name: queueName,
        max_concurrent: 10,
        retry_policy: {
          max_retries: 3,
          backoff_multiplier: 2,
        },
      });

      console.log(`🌧️  Created queue: ${queueName}`);
      return response.data;
    } catch (error: any) {
      console.error('Raindrop create queue error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add task to a queue
   * @param queueId Queue ID
   * @param task Task data
   */
  async addToQueue(queueId: string, task: any): Promise<RaindropTask> {
    if (!this.isEnabled) {
      throw new Error('Raindrop is not configured.');
    }

    try {
      const response = await this.client.post(`/queues/${queueId}/tasks`, task);
      return response.data;
    } catch (error: any) {
      console.error('Raindrop add to queue error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ============================================================================
  // SMARTSQL API - PostgreSQL database operations
  // ============================================================================

  /**
   * Execute SQL query via SmartSQL
   * @param query SQL query string
   * @param params Query parameters
   */
  async executeSQL(query: string, params?: any[]): Promise<SmartSQLResult> {
    if (!this.isEnabled) {
      throw new Error('Raindrop SmartSQL is not configured.');
    }

    try {
      const response = await this.client.post('/smartsql/execute', {
        query,
        params: params || [],
      });

      return response.data;
    } catch (error: any) {
      console.error('SmartSQL execute error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Initialize database schema via SmartSQL
   */
  async initializeDatabase(): Promise<void> {
    if (!this.isEnabled) {
      console.warn('⚠️  Raindrop SmartSQL not available. Using in-memory storage.');
      return;
    }

    console.log('🌧️  Initializing database via Raindrop SmartSQL...');

    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        fastino_user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Trades table
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        trade_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) REFERENCES users(user_id),
        ticker VARCHAR(10) NOT NULL,
        action VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        strategy_signal TEXT,
        user_reasoning TEXT,
        market_context TEXT,
        outcome JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Strategies table
      CREATE TABLE IF NOT EXISTS strategies (
        id SERIAL PRIMARY KEY,
        strategy_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) REFERENCES users(user_id),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        parameters JSONB NOT NULL,
        performance_metrics JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Evolution events table
      CREATE TABLE IF NOT EXISTS evolution_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) REFERENCES users(user_id),
        strategy_id VARCHAR(255) REFERENCES strategies(strategy_id),
        event_type VARCHAR(50) NOT NULL,
        metrics_before JSONB,
        metrics_after JSONB,
        changes JSONB,
        insights TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker);
      CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
      CREATE INDEX IF NOT EXISTS idx_evolution_events_user_id ON evolution_events(user_id);
    `;

    try {
      await this.executeSQL(schema);
      console.log('✅ Database schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Save user to database
   */
  async saveUser(userId: string, email: string, name?: string, fastinoUserId?: string): Promise<void> {
    if (!this.isEnabled) return;

    const query = `
      INSERT INTO users (user_id, email, name, fastino_user_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE
      SET email = EXCLUDED.email, name = EXCLUDED.name, fastino_user_id = EXCLUDED.fastino_user_id
    `;

    await this.executeSQL(query, [userId, email, name, fastinoUserId]);
  }

  /**
   * Save trade to database
   */
  async saveTrade(tradeData: any): Promise<void> {
    if (!this.isEnabled) return;

    const query = `
      INSERT INTO trades (
        trade_id, user_id, ticker, action, quantity, price,
        strategy_signal, user_reasoning, market_context, outcome
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (trade_id) DO UPDATE
      SET outcome = EXCLUDED.outcome
    `;

    await this.executeSQL(query, [
      tradeData.trade_id,
      tradeData.user_id,
      tradeData.ticker,
      tradeData.action,
      tradeData.quantity,
      tradeData.price,
      tradeData.strategy_signal,
      tradeData.user_reasoning,
      tradeData.market_context,
      tradeData.outcome ? JSON.stringify(tradeData.outcome) : null,
    ]);
  }

  /**
   * Get user trades from database
   */
  async getUserTrades(userId: string): Promise<any[]> {
    if (!this.isEnabled) return [];

    const query = `
      SELECT * FROM trades
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.executeSQL(query, [userId]);
    return result.rows;
  }

  // ============================================================================
  // OBSERVERS API - Automated tracking and monitoring
  // ============================================================================

  /**
   * Create an observer for trade outcomes
   * @param name Observer name
   * @param entityType Entity type to observe (e.g., 'trade')
   */
  async createObserver(name: string, entityType: string, callbackUrl?: string): Promise<Observer> {
    if (!this.isEnabled) {
      throw new Error('Raindrop is not configured.');
    }

    try {
      const response = await this.client.post('/observers', {
        name,
        entity_type: entityType,
        callback_url: callbackUrl,
        conditions: {
          // Trigger when trade outcome is updated
          field: 'outcome',
          operator: 'not_null',
        },
      });

      console.log(`🌧️  Created observer: ${name}`);
      return response.data;
    } catch (error: any) {
      console.error('Raindrop create observer error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Setup trade outcome observer
   * Automatically triggers re-evolution when enough trades complete
   */
  async setupTradeOutcomeObserver(userId: string): Promise<Observer | null> {
    if (!this.isEnabled) {
      console.log('⚠️  Raindrop not configured. Trade outcome observer not created.');
      return null;
    }

    try {
      return await this.createObserver(
        `trade_outcome_observer_${userId}`,
        'trade',
        `${process.env.API_URL}/api/evolution/auto-trigger`
      );
    } catch (error) {
      console.error('Failed to setup trade outcome observer:', error);
      return null;
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  /**
   * Health check for Raindrop service
   */
  async healthCheck(): Promise<{ status: string; available: boolean }> {
    if (!this.isEnabled) {
      return { status: 'not_configured', available: false };
    }

    try {
      const response = await this.client.get('/health');
      return { status: 'healthy', available: true };
    } catch (error) {
      return { status: 'error', available: false };
    }
  }

  /**
   * Get service info
   */
  getInfo(): {
    enabled: boolean;
    apiUrl: string;
    hasApiKey: boolean;
  } {
    return {
      enabled: this.isEnabled,
      apiUrl: RAINDROP_API_URL,
      hasApiKey: !!this.apiKey,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const raindropService = new RaindropService();

