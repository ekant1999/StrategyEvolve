# API Integration Architecture

## Overview
The Strategy Evolution system integrates three powerful APIs to create personalized, context-aware trading strategies:

1. **Fastino AI** - User behavioral learning and pattern recognition
2. **LinkUp** - Real-time market sentiment and news analysis
3. **Finnhub/Alpha Vantage** - Historical stock price data

---

## 🧠 FASTINO AI - Behavioral Learning Engine

### Purpose
Learns the user's unique trading style, preferences, and behavioral patterns to personalize strategy parameters.

### Implementation Location
- **Service:** `/backend/src/services/fastino.ts`
- **Used in:** `/backend/src/services/evolution_v2.ts` (Step 3)

### API Endpoints Used

#### 1. **POST /register**
```typescript
fastinoService.registerUser(email, userId, name)
```
- **When:** User signs up
- **Purpose:** Register user with Fastino for behavioral tracking
- **Data Sent:**
  - Email, user ID, name
  - Purpose: "Trading strategy optimization agent that learns user's behavioral patterns"
  - Traits: name, timezone

#### 2. **POST /ingest**
```typescript
fastinoService.ingestTrade(userId, tradeData)
```
- **When:** Every time a user creates a trade
- **Purpose:** Feed user trading activity into Fastino's learning system
- **Data Sent per Trade:**
  ```
  Trade Execution:
  - Ticker: AAPL
  - Action: BUY/SELL
  - Quantity: 100
  - Price: $175.50
  - Total Value: $17,550
  - Strategy Signal: "MA crossover bullish"
  - User Reasoning: "Strong earnings expected"
  - Market Context: "Tech sector rally"
  - Outcome: Return %, exit price, duration (if available)
  ```
- **Automatic:** Happens in background when trades are saved to database

#### 3. **POST /query**
```typescript
fastinoService.queryBehavior(userId, question)
```
- **When:** During strategy evolution
- **Purpose:** Query Fastino about user's trading patterns
- **Questions Asked:**
  1. "What is this user's trading style? Do they prefer aggressive entries, conservative entries, or balanced approaches? What stocks do they trade most?"
  2. "What is this user's risk tolerance and position sizing preference? Do they take large or small positions? How long do they typically hold trades?"

#### 4. **GET /summary**
```typescript
fastinoService.getSummary(userId, 500)
```
- **When:** During evolution or profile view
- **Purpose:** Get comprehensive summary of user's trading behavior
- **Returns:** 500-character summary of patterns and insights

### Data Flow: Fastino
```
User Creates Trade
    ↓
Backend saves to database
    ↓
Backend calls fastinoService.ingestTrade()
    ↓
Fastino learns from trade data
    ↓
During Evolution:
    • Query trading style
    • Query risk tolerance
    • Get summary
    ↓
Build Behavioral Profile:
    • Risk appetite (0-1)
    • Entry style (aggressive/conservative/balanced)
    • Position sizing preference
    • Favorite tickers
    • Trading frequency
    ↓
Adjust Strategy Parameters:
    • Position size based on user preference
    • RSI thresholds based on entry style
    • MA periods based on risk appetite
```

### Example Behavioral Adjustments
```typescript
// If user is AGGRESSIVE (from Fastino insights):
- Risk appetite: 0.8
- Position size: ↑ 30% larger
- RSI threshold: ↓ 5 points (earlier entries)
- MA periods: ↓ 20% shorter (faster signals)

// If user is CONSERVATIVE:
- Risk appetite: 0.3
- Position size: ↓ 10% of usual
- RSI threshold: ↑ 5 points (safer entries)
- MA periods: ↑ 20% longer (smoother signals)
```

---

## 📰 LINKUP - Market Sentiment & News Analysis

### Purpose
Provides real-time market sentiment, news analysis, and contextual market intelligence to adjust strategies based on current market conditions.

### Implementation Location
- **Service:** `/backend/src/services/linkup.ts`
- **Used in:** `/backend/src/services/evolution_v2.ts` (Step 2)

### API Endpoints Used

#### 1. **POST /v1/search - Ticker News**
```typescript
linkUpService.getTickerNews(ticker, days)
```
- **When:** During strategy evolution for each user's traded ticker
- **Purpose:** Get latest news, earnings, analyst ratings, price movements
- **Parameters:**
  - `q`: "${ticker} stock latest news, earnings, analyst ratings, market events and price movements"
  - `depth`: "standard"
  - `outputType`: "sourcedAnswer"
  - `fromDate`: Last 7 days
  - `includeDomains`: seekingalpha.com, finance.yahoo.com, bloomberg.com, reuters.com
  - `maxResults`: 10

#### 2. **POST /v1/search - Sentiment Analysis**
```typescript
linkUpService.getSentiment(ticker)
```
- **When:** During evolution for each ticker
- **Purpose:** Determine market sentiment (bullish/bearish/neutral)
- **Parameters:**
  - `q`: "Market sentiment and investor opinion on ${ticker} stock right now"
  - `depth`: "standard"
  - `outputType`: "sourcedAnswer"
  - `fromDate`: Last 3 days
  - `maxResults`: 5

#### 3. **POST /v1/search - Macro Events**
```typescript
linkUpService.getMacroEvents()
```
- **When:** Can be called for overall market context
- **Purpose:** Federal Reserve, interest rates, GDP, unemployment, inflation news
- **Parameters:**
  - `q`: "Latest Federal Reserve announcements, interest rate decisions, GDP data..."
  - `depth`: "deep"
  - `fromDate`: Last 7 days

#### 4. **POST /v1/search - Earnings Data**
```typescript
linkUpService.getEarningsData(ticker)
```
- **When:** Available for detailed earnings analysis
- **Purpose:** Quarterly earnings, revenue, EPS, guidance
- **Parameters:**
  - `q`: "${ticker} quarterly earnings report, revenue, EPS, earnings beat or miss, guidance"
  - `depth`: "deep"
  - `fromDate`: Last 30 days

### Data Flow: LinkUp
```
User has traded: AAPL, GOOGL, MSFT
    ↓
During Evolution, for each ticker:
    ↓
1. Get Latest News (last 7 days)
   └─ LinkUp searches financial news sources
   └─ Returns: Answer + Sources (URLs)
    ↓
2. Get Sentiment (last 3 days)
   └─ LinkUp analyzes investor opinion
   └─ Returns: Answer + Sources
    ↓
3. Parse Sentiment Score (-1 to +1)
   └─ Scan for keywords:
       • Bullish: "bullish", "positive", "growth", "upgrade", "beat", "strong"
       • Bearish: "bearish", "negative", "decline", "downgrade", "miss", "weak"
   └─ Calculate score from keyword frequency
    ↓
4. Build Sentiment Map:
   {
     "AAPL": { score: 0.6, confidence: 0.85, summary: "...", sources: [...] },
     "GOOGL": { score: -0.2, confidence: 0.75, summary: "...", sources: [...] }
   }
    ↓
5. Apply Sentiment Adjustments:
   • If sentiment > 0.5 (Strong Bullish): ↑ position size 15%
   • If sentiment < -0.5 (Strong Bearish): ↓ position size 15%
   • Adjust strategy confidence based on sentiment confidence
```

### Sentiment Scoring Example
```typescript
News: "Apple stock showing bullish momentum after strong earnings beat. 
       Analysts upgrade with positive outlook on iPhone growth."

Keywords found:
  ✓ bullish (+0.2)
  ✓ strong (+0.2)
  ✓ beat (+0.2)
  ✓ upgrade (+0.2)
  ✓ positive (+0.2)
  ✓ growth (+0.2)

Final Score: 0.8 → 🟢 STRONGLY BULLISH
Action: Increase position size, favor buy signals
```

---

## 📊 FINNHUB / ALPHA VANTAGE - Stock Market Data

### Purpose
Provides historical price data (OHLCV) for backtesting strategies with real market conditions.

### Implementation Location
- **Service:** `/backend/src/services/stockData.ts`
- **Used in:** `/backend/src/services/evolution_v2.ts` (Step 1)

### Provider Selection
```typescript
// Priority order:
1. Alpha Vantage (if ALPHA_VANTAGE_API_KEY is set)
2. Finnhub (if FINNHUB_API_KEY is set)
3. Synthetic Data (fallback if no API keys)
```

### API Endpoints Used

#### Alpha Vantage

**1. GET TIME_SERIES_DAILY**
```typescript
alphaVantageProvider.getHistoricalData(ticker, days)
```
- **URL:** `https://www.alphavantage.co/query`
- **Parameters:**
  - `function`: "TIME_SERIES_DAILY"
  - `symbol`: "AAPL"
  - `outputsize`: "full" (for >100 days) or "compact"
  - `apikey`: API key
- **Returns:** Daily OHLCV data
- **Rate Limit:** 5 calls/minute (free tier)

**2. GET GLOBAL_QUOTE**
```typescript
alphaVantageProvider.getCurrentPrice(ticker)
```
- **Purpose:** Get current real-time price
- **Parameters:** `function`: "GLOBAL_QUOTE", `symbol`: ticker

#### Finnhub

**1. GET /stock/candle**
```typescript
finnhubProvider.getHistoricalData(ticker, days)
```
- **URL:** `https://finnhub.io/api/v1/stock/candle`
- **Parameters:**
  - `symbol`: "AAPL"
  - `resolution`: "D" (daily)
  - `from`: Unix timestamp (days ago)
  - `to`: Unix timestamp (now)
  - `token`: API key
- **Returns:** Arrays of OHLCV data
- **Rate Limit:** 60 calls/minute (free tier)

**2. GET /quote**
```typescript
finnhubProvider.getCurrentPrice(ticker)
```
- **Purpose:** Get current quote
- **Returns:** Current price, daily change, etc.

### Data Flow: Stock Data
```
User trades: AAPL (100 trades), GOOGL (50 trades), MSFT (25 trades)
    ↓
Extract unique tickers from user's trade history
    ↓
For each ticker:
    ↓
1. Call stockDataService.getHistoricalData(ticker, 252)
   └─ Fetch 252 days (1 trading year) of data
   └─ Try primary provider (Alpha Vantage/Finnhub)
   └─ If fails: Use synthetic data fallback
    ↓
2. Convert to MarketData format:
   [
     {
       date: Date,
       open: 175.50,
       high: 178.20,
       low: 174.80,
       close: 177.90,
       volume: 45000000
     },
     ...
   ]
    ↓
3. Rate limiting:
   └─ Wait 12 seconds between calls (Alpha Vantage)
   └─ Or 1 second (Finnhub)
    ↓
4. Store in Map<ticker, MarketData[]>
    ↓
5. Use for backtesting:
   └─ Test each strategy variant against real historical data
   └─ Calculate: Sharpe ratio, returns, drawdown, win rate
   └─ Select best performing strategy
```

### Stock Data Format
```typescript
StockPrice {
  date: Date(2024-01-15),
  open: 185.20,
  high: 187.50,
  low: 184.10,
  close: 186.80,
  volume: 52000000
}

// Used to calculate:
- Moving averages (MA 20, MA 50)
- RSI (Relative Strength Index)
- Price momentum
- Entry/exit signals
- Backtest performance
```

---

## 🔄 Complete Evolution Flow

### Step-by-Step Process

```
USER TRIGGERS EVOLUTION
    ↓
┌─────────────────────────────────────────┐
│  1. GATHER USER DATA                    │
│  • Get user's trade history from DB     │
│  • Extract tickers: [AAPL, GOOGL, MSFT] │
│  • Count: 175 trades over 3 months      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  2. FETCH STOCK DATA (Finnhub)         │
│  • AAPL: 252 days of OHLCV data        │
│  • GOOGL: 252 days of OHLCV data       │
│  • MSFT: 252 days of OHLCV data        │
│  → Market data ready for backtesting    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  3. GET SENTIMENT (LinkUp)              │
│  For AAPL:                              │
│  • Query: Latest news & sentiment       │
│  • Result: Bullish (+0.6), 85% conf    │
│  • Sources: Bloomberg, Yahoo Finance    │
│  For GOOGL:                             │
│  • Result: Neutral (0.0), 70% conf     │
│  For MSFT:                              │
│  • Result: Bullish (+0.4), 80% conf    │
│  → Sentiment map built                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  4. ANALYZE BEHAVIOR (Fastino)          │
│  Query 1: "What's trading style?"       │
│  • Answer: "Aggressive momentum trader" │
│  Query 2: "Risk tolerance?"             │
│  • Answer: "High risk, large positions" │
│  Query 3: Get summary                   │
│  • Summary: "Prefers tech stocks..."    │
│  → Build profile:                       │
│    • Risk appetite: 0.8 (high)          │
│    • Entry style: aggressive            │
│    • Position size pref: 0.25           │
│    • Favorite tickers: AAPL, NVDA       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  5. OPTIMIZE STRATEGY                   │
│  Base Strategy:                         │
│  • MA Short: 20, MA Long: 50           │
│  • RSI: 30, Position: 10%              │
│  Generate 15 variants                   │
│  Test each on real AAPL data           │
│  → Best variant found:                  │
│    Sharpe: 1.2, Return: 18%            │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  6. APPLY BEHAVIORAL ADJUSTMENTS        │
│  From Fastino insights:                 │
│  • Position size: 10% → 25%            │
│    (user prefers large positions)       │
│  • RSI threshold: 30 → 25              │
│    (aggressive entries)                 │
│  • MA Short: 20 → 16                   │
│  • MA Long: 50 → 40                    │
│    (faster signals for high risk)       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  7. APPLY SENTIMENT ADJUSTMENTS         │
│  From LinkUp sentiment:                 │
│  • Avg sentiment: +0.33 (bullish)      │
│  • Confidence: 0.78                     │
│  • Adjustment: Position +15%            │
│    (strong bullish confidence)          │
│  • Final position: 28.75%              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  8. BACKTEST FINAL STRATEGY             │
│  Test on 252 days of real AAPL data    │
│  → Final metrics:                       │
│    • Sharpe: 1.45                       │
│    • Return: 22.5%                      │
│    • Win Rate: 62%                      │
│    • Max Drawdown: -12%                 │
│    • Trades: 38                         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  9. SAVE & RETURN                       │
│  • Save evolved strategy to DB          │
│  • Save evolution event                 │
│  • Generate insights report             │
│  → Return to user                       │
└─────────────────────────────────────────┘
```

---

## 📝 Logging Examples

### Console Output During Evolution

```bash
🚀 Starting comprehensive strategy evolution...

📊 Found 175 user trades
📊 Sample trades: AAPL BUY @ $175.50, GOOGL BUY @ $140.20, MSFT SELL @ $380.00
📊 User trades 12 different stocks: AAPL, GOOGL, MSFT, NVDA, TSLA...

📊 Fetching historical data for AAPL...
✅ Retrieved 252 days of data for AAPL

🔍 ========== LINKUP API CALL ==========
📰 Querying LinkUp for AAPL...

📊 LINKUP RESPONSE for AAPL:
─────────────────────────────────────
📰 News Answer (last 7 days):
   "Apple stock has shown strong momentum following better-than-expected quarterly earnings. Analysts have upgraded their price targets citing robust iPhone 15 demand..."

💭 Sentiment Answer:
   "Market sentiment on Apple is currently bullish. Investors are optimistic about the company's AI initiatives and services growth..."

🔗 Sources (3):
   1. Bloomberg: https://bloomberg.com/...
   2. Yahoo Finance: https://finance.yahoo.com/...
   3. Reuters: https://reuters.com/...

📈 SENTIMENT ANALYSIS RESULT for AAPL:
   ├─ Positive words found: bullish, strong, robust, optimistic
   ├─ Negative words found: none
   ├─ Raw score: 0.80
   └─ Final sentiment: 🟢 BULLISH

✅ Sentiment for AAPL: 0.80

🔍 ========== END LINKUP API ==========

🧠 ========== FASTINO API CALL ==========
📝 FASTINO QUERY 1: Trading Style Analysis
─────────────────────────────────────
Question: "What is this user's trading style?..."

💡 FASTINO ANSWER 1:
   "This user demonstrates an aggressive momentum-based trading style, frequently entering positions during strong uptrends. They show a preference for technology stocks, particularly AAPL and NVDA, and tend to take positions when technical indicators align with positive market sentiment."

📝 FASTINO QUERY 2: Risk Tolerance Analysis
─────────────────────────────────────
Question: "What is this user's risk tolerance?..."

💡 FASTINO ANSWER 2:
   "The user exhibits high risk tolerance, regularly taking positions of 20-30% of capital. Average hold duration is 8 days, indicating active trading. They appear comfortable with volatility and tend to increase position sizes during winning streaks."

📊 BEHAVIORAL PROFILE BUILT:
─────────────────────────────────────
   ├─ Risk Appetite: 80%
   ├─ Entry Style: AGGRESSIVE
   ├─ Position Sizing: 25.0%
   ├─ Win Rate: 58.5%
   ├─ Trading Frequency: high
   └─ Favorite Tickers: AAPL, NVDA, GOOGL, TSLA, MSFT

🧠 ========== END FASTINO API ==========

🔬 Generating strategy variants...
📈 Backtesting variants with real market data...

   Variant tested: Sharpe 0.85, Return 15.20%, Trades: 32
   ✨ New best strategy found: Sharpe 0.85, Return 15.20%, Trades: 32
   Variant tested: Sharpe 1.12, Return 18.50%, Trades: 38
   ✨ New best strategy found: Sharpe 1.12, Return 18.50%, Trades: 38
   ...

🔧 ========== APPLYING BEHAVIORAL ADJUSTMENTS ==========

📊 Position Size Adjustment:
   Original: 10.0%
   User Preference: 25.0%
   → Adjusted: 25.0%

📈 RSI Threshold Adjustment (Aggressive Entry):
   Original: 30
   → Lowered by 5 points to: 25
   Reason: User prefers earlier, more aggressive entries

📉 Moving Average Adjustment (High Risk Appetite):
   MA Short: 20 → 16 (20% faster)
   MA Long: 50 → 40 (20% faster)
   Reason: User tolerates higher risk, prefers faster signals

✅ Final Behavioral Adjustments:
   Position Size: 25.0%
   RSI Threshold: 25
   MA Short: 16
   MA Long: 40

🔧 ========== END BEHAVIORAL ADJUSTMENTS ==========

📰 Applying sentiment-based adjustments...
   ✅ Sentiment adjustments applied: {
     avg_sentiment: 0.600,
     avg_confidence: 0.850,
     final_position_size: 0.288
   }

🎯 Backtesting final evolved strategy...
📊 Final backtest with 252 days of data
📊 Final metrics calculated: {
  sharpe: 1.450,
  return: 22.50,
  trades: 38,
  winRate: 62.0
}

✅ Evolution complete!
   📊 Final Metrics: Sharpe 1.450, Return 22.50%, Trades: 38
   📈 Improvement: +0.650 Sharpe, +10.00% Return
```

---

## 🔑 Environment Variables Required

```bash
# Fastino AI
FASTINO_API_KEY=your_fastino_key

# LinkUp Search
LINKUP_API_KEY=your_linkup_key

# Stock Data (choose one)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
# OR
FINNHUB_API_KEY=your_finnhub_key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=strategy_evolve
DB_USER=strategy_user
DB_PASSWORD=strategy_pass
```

---

## 📊 Data Flow Summary

```
┌─────────────────┐
│  USER TRADES    │ → Stored in PostgreSQL
│  (Database)     │ → Auto-ingested to Fastino
└────────┬────────┘
         │
         ↓
┌────────────────────────────────────────────────┐
│         EVOLUTION TRIGGER                      │
│  (User clicks "Evolve Strategy")               │
└────────┬───────────────────────────────────────┘
         │
         ├─→ [FINNHUB] Get 252 days OHLCV data
         │   └─> For: AAPL, GOOGL, MSFT (user's stocks)
         │
         ├─→ [LINKUP] Get sentiment & news
         │   └─> Query each ticker, parse sentiment
         │
         ├─→ [FASTINO] Query trading behavior
         │   └─> Get style, risk tolerance, summary
         │
         ↓
┌────────────────────────────────────────────────┐
│   STRATEGY OPTIMIZATION ENGINE                 │
│   • Generate 15 variants                       │
│   • Backtest on real data                      │
│   • Apply behavioral adjustments (Fastino)     │
│   • Apply sentiment adjustments (LinkUp)       │
│   • Final backtest                             │
└────────┬───────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────┐
│   EVOLVED STRATEGY                             │
│   • Personalized parameters                    │
│   • Context-aware positioning                  │
│   • Validated with real market data            │
└────────────────────────────────────────────────┘
```

---

## 🎯 Key Benefits

1. **Personalization (Fastino)**
   - Strategy adapts to YOUR trading style
   - Learns from YOUR historical decisions
   - Adjusts risk to YOUR comfort level

2. **Market Context (LinkUp)**
   - Real-time sentiment awareness
   - News-informed adjustments
   - Market condition adaptation

3. **Data-Driven (Finnhub/Alpha Vantage)**
   - Backtested on real market data
   - Not synthetic/fake data
   - Validated performance metrics

---

## 🚀 Future Enhancements

- [ ] Multi-ticker portfolio optimization
- [ ] Macro event integration (Fed announcements)
- [ ] Earnings calendar integration
- [ ] Social sentiment (Twitter/Reddit)
- [ ] Real-time strategy adjustments
- [ ] A/B testing of evolved vs base strategies

