# Strategy Evolution Model Architecture

## 📊 Data Flow Overview

```
User Trades → Database → Fastino (Behavioral Learning)
                              ↓
                    Strategy Evolution Engine
                              ↓
              [Quantitative] [Behavioral] [Contextual]
                              ↓
                    Backtesting & Scoring
                              ↓
                    Dashboard Display
```

---

## 🎯 Where Dashboard Data Comes From

### 1. **Metrics Cards (Top 4 KPIs)**

**Source:** `backend/src/services/strategy.ts` → `backtest()` method

**Data Flow:**
1. Dashboard calls `strategyApi.getAll()` → `/api/strategies`
2. Backend returns strategies from PostgreSQL database
3. Each strategy has `metrics` object calculated during backtesting
4. Dashboard displays `currentStrategy.metrics` or defaults

**Metrics Shown:**
- **Sharpe Ratio**: Risk-adjusted return metric
- **Total Return**: Percentage gain/loss
- **Win Rate**: Percentage of profitable trades
- **Max Drawdown**: Maximum peak-to-trough decline

### 2. **Strategy Performance Chart**

**Current Status:** Uses **mock data** generated in `Dashboard.tsx` (line 69-87)

**How it works:**
```typescript
// Currently generates random data for visualization
generateChartData() {
  // Creates 30 days of mock data
  // base: 100 + random(0-15)
  // optimized: appears after day 10
  // hybrid: appears after day 20
}
```

**Future Enhancement:** Should use actual strategy equity curves from backtesting

### 3. **Evolution Timeline**

**Source:** `evolutionApi.getHistory()` → `/api/evolution/history`

**Data Flow:**
1. Evolution events stored in PostgreSQL `evolution_events` table
2. Each event contains:
   - Improvement metrics (sharpe_delta, return_delta)
   - Insights text
   - Strategy IDs (old → new)

---

## 🤖 How the Model Works

### Model Architecture: 3-Layer Evolution System

```
┌─────────────────────────────────────────┐
│  Layer 1: Quantitative Optimization    │
│  - Parameter tuning (MA, RSI)          │
│  - Genetic algorithm (20 variants)      │
│  - Backtesting & selection              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 2: Behavioral Learning (Fastino)│
│  - User trade patterns                  │
│  - Override analysis                    │
│  - Position sizing preferences          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 3: Market Context (LinkUp)       │
│  - Real-time news & sentiment           │
│  - Macro events                         │
│  - Market conditions                    │
└─────────────────────────────────────────┘
                    ↓
         Hybrid Strategy Synthesis
```

---

## 📥 Model Inputs

### 1. **Base Strategy Parameters** (Initial Input)

```typescript
{
  ma_short: 20,        // Short moving average period
  ma_long: 50,         // Long moving average period
  rsi_threshold: 30,   // RSI oversold/overbought threshold
  position_size: 0.1   // 10% of capital per trade
}
```

**Location:** `backend/src/routes/index.ts` (line 80-88) - Base strategy initialization

### 2. **Market Data** (Generated for Backtesting)

**Input Generation:** `strategyService.generateSampleData(252)` 

**What it generates:**
- 252 days of OHLCV data (1 trading year)
- Random walk with trend bias
- Variable volatility (2-4)
- Random starting price (80-120)

**Data Structure:**
```typescript
{
  date: Date,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}
```

### 3. **User Behavioral Data** (From Fastino)

**Input Source:** User's trade history in PostgreSQL → Fastino API

**What Fastino analyzes:**
- When user outperforms systematic strategies
- Position sizing patterns
- Signal override patterns
- Risk management tendencies

**Location:** `backend/src/services/evolution.ts` (line 57-100)

### 4. **Market Context** (From LinkUp)

**Input Source:** LinkUp API

**What it provides:**
- Macro economic events
- Ticker-specific news
- Market sentiment (positive/negative/neutral)

**Location:** `backend/src/services/evolution.ts` (line 102-144)

---

## 🧮 How Scores Are Generated

### Step 1: Strategy Backtesting

**Location:** `backend/src/services/strategy.ts` → `backtest()` method (line 67-122)

**Process:**

1. **Calculate Technical Indicators:**
   ```typescript
   // Moving Averages
   ma_short = calculateMA(marketData, ma_short_period)
   ma_long = calculateMA(marketData, ma_long_period)
   
   // RSI (Relative Strength Index)
   rsi = calculateRSI(marketData, 14)
   ```

2. **Generate Trading Signals:**
   ```typescript
   // Buy Signal
   bullish = ma_short[i] > ma_long[i] && rsi[i] < (100 - rsi_threshold)
   
   // Sell Signal
   bearish = ma_short[i] < ma_long[i] || rsi[i] > rsi_threshold
   ```

3. **Execute Trades:**
   - Buy: Allocate `position_size * capital` when bullish
   - Sell: Close position when bearish
   - Track equity curve over time

4. **Calculate Metrics** (line 172-244):

   **a) Total Return:**
   ```typescript
   total_return = ((final_capital - initial_capital) / initial_capital) * 100
   ```

   **b) Sharpe Ratio:**
   ```typescript
   // Calculate daily returns
   daily_returns = [(equity[i] - equity[i-1]) / equity[i-1]]
   
   // Sharpe = (Avg Return / Std Dev) * sqrt(252 trading days)
   sharpe_ratio = (avg_return / std_return) * sqrt(252)
   ```
   **Formula:** `(Mean Return - Risk Free Rate) / Standard Deviation of Returns * √252`
   - Higher = Better risk-adjusted returns
   - >1 = Good, >2 = Very Good, >3 = Excellent

   **c) Max Drawdown:**
   ```typescript
   // Track peak equity
   // Calculate: (peak - current) / peak * 100
   max_drawdown = maximum drawdown percentage
   ```

   **d) Win Rate:**
   ```typescript
   win_rate = (winning_trades / total_trades) * 100
   ```

### Step 2: Quantitative Optimization

**Location:** `backend/src/services/evolution.ts` → `optimizeQuantitative()` (line 20-54)

**Process:**

1. **Generate Variants:**
   ```typescript
   // Create 20 strategy variants with random parameter adjustments
   variants = generateVariants(baseStrategy, 20)
   // Each variant has slightly different:
   // - ma_short: ±5
   // - ma_long: ±10
   // - rsi_threshold: ±5
   // - position_size: ±20%
   ```

2. **Backtest All Variants:**
   ```typescript
   // Same market data for fair comparison
   marketData = generateSampleData(252)
   results = variants.map(v => backtest(v, marketData))
   ```

3. **Select Best:**
   ```typescript
   // Choose variant with highest Sharpe ratio
   bestStrategy = results.reduce((best, current) =>
     current.metrics.sharpe_ratio > best.metrics.sharpe_ratio ? current : best
   )
   ```

4. **Calculate Improvement:**
   ```typescript
   sharpe_delta = bestStrategy.sharpe_ratio - baseStrategy.sharpe_ratio
   return_delta = bestStrategy.total_return - baseStrategy.total_return
   ```

### Step 3: Hybrid Strategy Synthesis

**Location:** `backend/src/services/evolution.ts` → `synthesizeHybridStrategy()` (line 147-202)

**Process:**

1. **Combine Optimized Strategy + Behavioral Insights:**
   ```typescript
   // Apply behavioral adjustments
   position_size = optimized.position_size * behavioral_modifier
   ```

2. **Re-backtest with Same Market Data:**
   ```typescript
   // Use same market data for consistency
   marketData = generateSampleData(252)
   hybridStrategy.metrics = backtest(hybridStrategy, marketData)
   ```

3. **Final Score:**
   ```typescript
   // Compare hybrid vs base strategy
   improvement = {
     sharpe_delta: hybrid.sharpe - base.sharpe,
     return_delta: hybrid.return - base.return
   }
   ```

---

## 📈 Score Interpretation

### Sharpe Ratio
- **0.8** (Base): Moderate risk-adjusted returns
- **1.0-1.5**: Good performance
- **1.5-2.0**: Very good performance
- **>2.0**: Excellent performance

### Total Return
- **12.5%** (Base): Annual return
- **Improvement**: Shows delta from base strategy

### Win Rate
- **54.3%** (Base): Slightly better than random (50%)
- **>60%**: Strong strategy
- **>70%**: Excellent strategy

### Max Drawdown
- **-18.2%** (Base): Maximum loss from peak
- **Lower is better** (less risk)

---

## 🔄 Complete Evolution Flow

```
1. User triggers evolution
   ↓
2. Load base strategy from database
   ↓
3. Quantitative Optimization:
   - Generate 20 variants
   - Backtest each on 252 days of market data
   - Select best by Sharpe ratio
   ↓
4. Behavioral Learning:
   - Query Fastino for user patterns
   - Extract position sizing preferences
   - Get risk management insights
   ↓
5. Market Context:
   - Fetch LinkUp news & sentiment
   - Get macro events
   ↓
6. Hybrid Synthesis:
   - Combine optimized + behavioral + contextual
   - Re-backtest hybrid strategy
   ↓
7. Calculate final scores:
   - Sharpe ratio
   - Total return
   - Win rate
   - Max drawdown
   ↓
8. Save to database
   ↓
9. Display on dashboard
```

---

## 🎨 Dashboard Data Sources Summary

| Component | Data Source | Current Status |
|-----------|-------------|----------------|
| **Metrics Cards** | Strategy metrics from DB | ✅ Real data |
| **Performance Chart** | Mock data generator | ⚠️ Needs real equity curves |
| **Evolution Timeline** | Evolution events from DB | ✅ Real data |
| **Evolution Status** | Hardcoded | ⚠️ Should use trade count |

---

## 🔧 Key Files

- **Backtesting Engine:** `backend/src/services/strategy.ts`
- **Evolution Logic:** `backend/src/services/evolution.ts`
- **Dashboard:** `frontend/src/pages/Dashboard.tsx`
- **API Routes:** `backend/src/routes/index.ts`
- **Database Models:** `backend/src/models/`

---

## 💡 Future Enhancements

1. **Real Chart Data:** Use actual equity curves from backtesting
2. **Real-time Updates:** WebSocket for live strategy performance
3. **Historical Data:** Use real market data instead of generated
4. **Advanced Metrics:** Sortino ratio, Calmar ratio, etc.
5. **Strategy Comparison:** Side-by-side performance analysis

