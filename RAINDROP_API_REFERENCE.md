# 🌧️ Raindrop API Reference

Quick reference for all Raindrop-related endpoints and methods in StrategyEvolve.

---

## 📡 REST API Endpoints

Base URL: `http://localhost:3001/api/raindrop`

### Status & Health

#### `GET /status`

Check Raindrop service status and availability.

**Request**:
```bash
curl http://localhost:3001/api/raindrop/status
```

**Response**:
```json
{
  "enabled": true,
  "available": true,
  "status": "healthy",
  "info": {
    "enabled": true,
    "apiUrl": "https://api.liquidmetal.ai/v1",
    "hasApiKey": true
  },
  "features": {
    "tasks": "Parallel task execution",
    "queues": "Distributed workload management",
    "smartsql": "PostgreSQL database operations",
    "observers": "Automated monitoring and triggers"
  }
}
```

---

### Parallel Backtesting

#### `POST /demo/parallel-backtest`

Run a demo of parallel backtesting using Raindrop Tasks.

**Request**:
```bash
curl -X POST http://localhost:3001/api/raindrop/demo/parallel-backtest \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "success": true,
  "message": "Parallel backtest completed successfully",
  "stats": {
    "total_variants": 10,
    "duration_ms": 1842,
    "avg_time_per_variant": 184
  },
  "best_strategy": {
    "parameters": {
      "ma_short": 18,
      "ma_long": 48,
      "rsi_threshold": 28,
      "position_size": 0.12
    },
    "metrics": {
      "sharpe_ratio": 1.45,
      "total_return": 22.3,
      "win_rate": 64.2,
      "max_drawdown": -11.8,
      "trades": 42
    }
  },
  "all_results": [
    { "sharpe": 1.45, "return": 22.3, "trades": 42 },
    { "sharpe": 1.32, "return": 19.8, "trades": 38 }
  ]
}
```

**Performance**: ~2 seconds for 10 variants (vs ~13 seconds sequential)

---

### Task Management

#### `POST /demo/create-task`

Create a custom Raindrop task.

**Request**:
```bash
curl -X POST http://localhost:3001/api/raindrop/demo/create-task \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "backtest",
    "payload": {
      "strategy": {...},
      "ticker": "AAPL",
      "days": 252
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "task_id": "task_abc123",
    "status": "pending",
    "created_at": "2025-11-15T10:30:00Z"
  }
}
```

#### `GET /demo/task/:taskId`

Get the status of a task.

**Request**:
```bash
curl http://localhost:3001/api/raindrop/demo/task/task_abc123
```

**Response**:
```json
{
  "success": true,
  "task": {
    "task_id": "task_abc123",
    "status": "completed",
    "result": {
      "sharpe": 1.45,
      "totalReturn": 22.3,
      "trades": 42
    },
    "created_at": "2025-11-15T10:30:00Z",
    "completed_at": "2025-11-15T10:30:05Z"
  }
}
```

**Status Values**:
- `pending` - Task queued
- `running` - Task executing
- `completed` - Task finished successfully
- `failed` - Task encountered error

---

### SmartSQL Database

#### `POST /demo/smartsql`

Execute a SQL query via Raindrop SmartSQL.

**Request**:
```bash
curl -X POST http://localhost:3001/api/raindrop/demo/smartsql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
    "params": ["user_123"]
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Query executed successfully",
  "result": {
    "rows": [
      {
        "id": 1,
        "trade_id": "trade_001",
        "user_id": "user_123",
        "ticker": "AAPL",
        "action": "BUY",
        "quantity": 100,
        "price": 175.50,
        "created_at": "2025-11-15T09:30:00Z"
      }
    ],
    "rowCount": 10
  }
}
```

**Common Queries**:

```sql
-- Get user trade count
SELECT COUNT(*) FROM trades WHERE user_id = $1

-- Get active strategies
SELECT * FROM strategies WHERE user_id = $1 AND is_active = true

-- Get evolution history
SELECT * FROM evolution_events WHERE user_id = $1 ORDER BY created_at DESC

-- Get recent trades with outcomes
SELECT * FROM trades WHERE user_id = $1 AND outcome IS NOT NULL
```

---

### Observers

#### `POST /demo/observer`

Create an observer for automated monitoring.

**Request**:
```bash
curl -X POST http://localhost:3001/api/raindrop/demo/observer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "trade_outcome_observer",
    "entityType": "trade",
    "callbackUrl": "http://localhost:3001/api/evolution/auto-trigger"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Observer created successfully",
  "observer": {
    "observer_id": "obs_xyz789",
    "name": "trade_outcome_observer",
    "entity_type": "trade",
    "callback_url": "http://localhost:3001/api/evolution/auto-trigger",
    "status": "active"
  }
}
```

**How It Works**:
1. Observer monitors the specified entity (`trade`)
2. When condition is met (e.g., `outcome` field updated)
3. Callback URL is triggered automatically
4. Evolution runs without manual intervention

---

### Examples & Documentation

#### `GET /demo/examples`

Get usage examples for all Raindrop features.

**Request**:
```bash
curl http://localhost:3001/api/raindrop/demo/examples
```

**Response**:
```json
{
  "message": "Raindrop Integration Examples",
  "features": {
    "tasks": {
      "description": "Parallel task execution for CPU-intensive operations",
      "example": "POST /api/raindrop/demo/parallel-backtest",
      "use_case": "Run 10+ backtest variants simultaneously"
    },
    "queues": {
      "description": "Distributed workload management with retry policies",
      "example": "POST /api/raindrop/demo/create-queue",
      "use_case": "Process evolution requests with automatic retries"
    },
    "smartsql": {
      "description": "PostgreSQL database operations via API",
      "example": "POST /api/raindrop/demo/smartsql",
      "use_case": "Persistent storage for trades and strategies"
    },
    "observers": {
      "description": "Automated monitoring and event-driven triggers",
      "example": "POST /api/raindrop/demo/observer",
      "use_case": "Auto-trigger evolution when trade outcomes update"
    }
  },
  "quick_test": {
    "curl": "curl -X GET http://localhost:3001/api/raindrop/status",
    "description": "Check if Raindrop is configured and healthy"
  }
}
```

---

## 🔧 TypeScript Service Methods

Import: `import { raindropService } from './services/raindrop';`

### Status & Availability

```typescript
// Check if Raindrop is configured and available
const isAvailable: boolean = raindropService.isAvailable();

// Check health status
const health = await raindropService.healthCheck();
// Returns: { status: 'healthy' | 'error' | 'not_configured', available: boolean }

// Get service info
const info = raindropService.getInfo();
// Returns: { enabled: boolean, apiUrl: string, hasApiKey: boolean }
```

---

### Parallel Backtesting

```typescript
import { BacktestTask, BacktestResult } from './services/raindrop';

// Prepare backtest tasks
const tasks: BacktestTask[] = variants.map(variant => ({
  strategy: variant,
  marketData: data,
  ticker: 'AAPL'
}));

// Run in parallel via Raindrop (or sequential fallback)
const results: BacktestResult[] = await raindropService.runParallelBacktests(tasks);

// Process results
results.forEach(result => {
  console.log(`Sharpe: ${result.sharpe}, Return: ${result.totalReturn}%`);
});
```

---

### Task Management

```typescript
// Create a task
const task = await raindropService.createTask('backtest', {
  strategy: myStrategy,
  marketData: data,
  ticker: 'AAPL'
});

console.log(`Task created: ${task.task_id}`);

// Check task status
const status = await raindropService.getTask(task.task_id);
console.log(`Status: ${status.status}`); // pending | running | completed | failed

// Wait for completion (with polling)
const completed = await raindropService.waitForTask(task.task_id, 60000);
console.log('Result:', completed.result);
```

---

### SmartSQL Database

```typescript
// Initialize database schema (run once on startup)
await raindropService.initializeDatabase();

// Execute custom SQL query
const result = await raindropService.executeSQL(
  'SELECT * FROM trades WHERE user_id = $1 AND ticker = $2',
  ['user_123', 'AAPL']
);

console.log(`Found ${result.rowCount} trades`);
result.rows.forEach(trade => {
  console.log(`${trade.ticker} ${trade.action} @ $${trade.price}`);
});

// Helper methods for common operations
await raindropService.saveUser('user_123', 'user@example.com', 'John Doe');
await raindropService.saveTrade(tradeData);
const trades = await raindropService.getUserTrades('user_123');
```

---

### Queue Management

```typescript
// Create a queue with concurrency limits
const queue = await raindropService.createQueue('evolution_queue');

// Add task to queue
await raindropService.addToQueue(queue.queue_id, {
  task_type: 'evolution',
  payload: { userId: 'user_123' },
  priority: 'high'
});
```

---

### Observers

```typescript
// Create a custom observer
const observer = await raindropService.createObserver(
  'my_observer',
  'trade',
  'http://localhost:3001/api/callback'
);

// Setup trade outcome observer (convenience method)
const tradeObserver = await raindropService.setupTradeOutcomeObserver('user_123');
// Automatically triggers evolution when trades complete
```

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  fastino_user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Trades Table

```sql
CREATE TABLE trades (
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
```

### Strategies Table

```sql
CREATE TABLE strategies (
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
```

### Evolution Events Table

```sql
CREATE TABLE evolution_events (
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
```

---

## 🔒 Security Best Practices

### SQL Injection Prevention

**Always use parameterized queries**:

```typescript
// ✅ GOOD - Parameterized query
await raindropService.executeSQL(
  'SELECT * FROM trades WHERE user_id = $1',
  [userId]
);

// ❌ BAD - String concatenation (vulnerable!)
await raindropService.executeSQL(
  `SELECT * FROM trades WHERE user_id = '${userId}'`
);
```

### API Key Management

```bash
# ✅ GOOD - Environment variable
export LM_API_KEY=your_key_here

# ❌ BAD - Hardcoded in code
const apiKey = 'lm_1234567890abcdef';
```

---

## ⚡ Performance Tips

### 1. Batch Operations

```typescript
// ✅ GOOD - Single query with multiple inserts
await raindropService.executeSQL(
  'INSERT INTO trades (trade_id, user_id, ticker) VALUES ($1, $2, $3), ($4, $5, $6)',
  ['t1', 'u1', 'AAPL', 't2', 'u1', 'GOOGL']
);

// ❌ SLOWER - Multiple queries
for (const trade of trades) {
  await raindropService.executeSQL('INSERT INTO trades...', [trade]);
}
```

### 2. Parallel Task Sizing

```typescript
// ✅ GOOD - 10-20 tasks (optimal parallelism)
const results = await raindropService.runParallelBacktests(tasks.slice(0, 15));

// ⚠️ SUBOPTIMAL - Too few tasks (underutilized)
const results = await raindropService.runParallelBacktests(tasks.slice(0, 3));

// ⚠️ MAY BE SLOW - Too many tasks (overhead)
const results = await raindropService.runParallelBacktests(tasks); // 200+ tasks
```

### 3. Query Optimization

```sql
-- ✅ GOOD - Indexed column
SELECT * FROM trades WHERE user_id = $1; -- uses idx_trades_user_id

-- ❌ SLOWER - Non-indexed search
SELECT * FROM trades WHERE user_reasoning LIKE '%bullish%';
```

---

## 🧪 Testing

### Unit Tests

```typescript
import { raindropService } from './services/raindrop';

describe('Raindrop Service', () => {
  it('should check availability', () => {
    const isAvailable = raindropService.isAvailable();
    expect(typeof isAvailable).toBe('boolean');
  });

  it('should handle unavailable gracefully', async () => {
    process.env.LM_API_KEY = '';
    const result = await raindropService.runParallelBacktests([]);
    // Should fallback to sequential
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

```bash
# Test status endpoint
curl http://localhost:3001/api/raindrop/status | jq '.enabled'

# Test parallel backtesting
time curl -X POST http://localhost:3001/api/raindrop/demo/parallel-backtest

# Test database
curl -X POST http://localhost:3001/api/raindrop/demo/smartsql \
  -d '{"query":"SELECT COUNT(*) FROM users"}' | jq '.result.rows[0]'
```

---

## 📞 Support

- **Documentation**: See `RAINDROP_GUIDE.md` for detailed guide
- **Examples**: `GET /api/raindrop/demo/examples`
- **Issues**: Check `RAINDROP_INTEGRATION_COMPLETE.md` troubleshooting section
- **LiquidMetal Docs**: [https://docs.liquidmetal.ai/](https://docs.liquidmetal.ai/)

---

**Last Updated**: November 15, 2025  
**API Version**: v1  
**Integration Status**: ✅ Complete

