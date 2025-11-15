# Debugging: Zero Metrics Issue

## Problem
After triggering evolution, all metrics show 0:
- Sharpe Ratio: 0.00
- Total Return: 0.00%
- Win Rate: 0.0%
- Total Trades: 0

## Root Cause Analysis

The issue is that the backtest function isn't generating trades, even with the forced trade logic in place.

## Steps to Debug

### 1. Check Backend Logs

When you trigger evolution, you should see these logs in your backend terminal:

```
🚀 Starting V2 evolution with real data for user: user_1763239376026
📊 Found 45 user trades
📊 Sample trades: ['TSLA BUY @ $250', ...]
📊 User trades 20 different stocks: TSLA, AAPL, ...
📊 Fetching data for TSLA...
✅ Loaded 252 days for TSLA, sample close prices: ['245.32', ...]
🔬 Generating strategy variants...
📈 Backtesting variants with real market data...
📊 Using 252 days of data for TSLA
```

**CRITICAL**: Look for this line for EACH variant:
```
📊 Trade generation complete: 0 trades from strategy signals
⚠️  Insufficient trades (0). FORCING 2 trades for valid backtest.
🔧 Forcing trades: BUY at index 75 ($245.32), SELL at index 176 ($267.89)
✅ Forced trades added: BUY 12.45 @ $245.32, SELL @ $267.89
  📈 [75] BUY executed: Position 12.45, Capital 96943.24
  📉 [176] SELL executed: Proceeds 13328.56, Capital 110271.80
✅ Forced backtest complete: Start $100000, End $110271.80, Return 10.27%
```

### 2. If You DON'T See the Forced Trade Logs

This means one of these issues:

**A. Backend didn't restart**
- Check if nodemon shows "restarting due to changes"
- Or manually restart: `cd backend && npm run dev`

**B. Compilation error**
- Look for red error text in backend logs
- Common errors: "Cannot find name", "has already been declared"

**C. Code isn't reaching the backtest function**
- Evolution might be failing before reaching backtest
- Look for error messages earlier in the logs

### 3. If You DO See the Forced Trade Logs

But metrics are still 0, this means:

**The metrics are being calculated but not saved to the database**

Check logs for:
```
📊 Final metrics calculated: {sharpe: 'X.XXX', return: 'X.XX', trades: X}
✅ V2 Evolution complete: Sharpe X.XXX, Return X.XX%, Trades: X
```

If `trades: 0` here, the forced trades aren't being counted in `calculateMetrics`.

### 4. Test Backtest Directly

Create a test file to bypass Evolution V2:

```typescript
// backend/test-backtest.ts
import { strategyService } from './src/services/strategy';

const testStrategy = {
  id: 'test',
  name: 'Test',
  type: 'base' as const,
  parameters: {
    ma_short: 20,
    ma_long: 50,
    rsi_threshold: 30,
    position_size: 0.1,
  },
  user_id: 'test',
  created_at: new Date(),
};

const marketData = strategyService.generateSampleData(252);
console.log('📊 Generated', marketData.length, 'days of sample data');

const metrics = strategyService.backtest(testStrategy, marketData);
console.log('📊 Metrics:', metrics);

if (metrics.num_trades === 0) {
  console.log('❌ BACKTEST FAILED: No trades generated!');
} else {
  console.log('✅ BACKTEST SUCCESS:', metrics.num_trades, 'trades');
}
```

Run it:
```bash
cd backend
npx tsx test-backtest.ts
```

Expected output:
```
📊 Generated 252 days of sample data
📊 Trade generation complete: 0 trades from strategy signals
⚠️  Insufficient trades (0). FORCING 2 trades for valid backtest.
🔧 Forcing trades: BUY at index 75 ($150.23), SELL at index 176 ($165.89)
...
✅ BACKTEST SUCCESS: 1 trades
📊 Metrics: { sharpe_ratio: X.XXX, total_return: X.XX, num_trades: 1, ... }
```

### 5. Common Issues

**Issue 1: Trades array is empty after forced logic**
- Check if `trades = []` is being called after forced trades
- Check if trades are being filtered out somewhere

**Issue 2: calculateMetrics not counting trades correctly**
- Look at the trade counting loop
- Ensure BUY-SELL pairs are consecutive

**Issue 3: Metrics overridden after calculation**
- Check if metrics are reset to 0 somewhere
- Search for `.metrics = {` or `metrics: {}`

## Solution Path

Based on your specific logs, we can identify where the process is failing and fix it.

**Please share**:
1. Full backend terminal output after triggering evolution
2. Any red error messages
3. Whether you see the "FORCING 2 trades" log

This will tell us exactly what's wrong!

