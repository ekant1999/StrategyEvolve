# Evolution V2 - Complete Rewrite with Real Data Integration

## Overview

The Evolution V2 system has been completely rewritten to integrate **real stock market data**, **live sentiment analysis**, and **personalized behavioral insights** into the strategy optimization process.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Evolution V2 Pipeline                     │
└─────────────────────────────────────────────────────────────┘

1. DATA COLLECTION
   ├── 📊 Stock Data Service (stockData.ts)
   │   ├── Alpha Vantage API (primary)
   │   ├── Finnhub API (alternative)
   │   └── Synthetic Data (fallback)
   │
   ├── 🔍 LinkUp Service (linkup.ts)
   │   ├── Ticker News
   │   ├── Sentiment Analysis
   │   ├── Earnings Data
   │   └── Macro Events
   │
   └── 🧠 Fastino Service (fastino.ts)
       ├── User Behavior Queries
       ├── Trading Pattern Analysis
       └── Profile Summary

2. STRATEGY OPTIMIZATION
   ├── Generate 15 strategy variants
   ├── Backtest with REAL market data
   ├── Score by Sharpe ratio + returns
   └── Select best performer

3. BEHAVIORAL ADJUSTMENTS
   ├── Analyze user's trading style
   ├── Adjust position sizing
   ├── Tune RSI thresholds
   └── Optimize MA periods

4. SENTIMENT ADJUSTMENTS
   ├── Aggregate market sentiment
   ├── Weight by confidence level
   ├── Adjust position sizing
   └── Apply risk modulation

5. FINAL VALIDATION
   ├── Backtest evolved strategy
   ├── Calculate performance metrics
   ├── Generate insights report
   └── Save to database
```

## Key Components

### 1. Stock Data Service (`backend/src/services/stockData.ts`)

Fetches real historical stock price data:

- **Primary**: Alpha Vantage (free tier: 5 calls/min, 500 calls/day)
- **Alternative**: Finnhub (free tier: 60 calls/min)
- **Fallback**: Synthetic realistic data generator

**Usage:**
```typescript
import { stockDataService } from './stockData';

// Get 252 days of historical data
const prices = await stockDataService.getHistoricalData('AAPL', 252);

// Get current price
const currentPrice = await stockDataService.getCurrentPrice('AAPL');
```

### 2. Evolution Service V2 (`backend/src/services/evolution_v2.ts`)

Complete rewrite with integrated data sources:

**Main Method:**
```typescript
const { strategy, event } = await evolutionServiceV2.optimizeAndEvolveStrategy(
  userId,
  baseStrategy
);
```

**What it does:**
1. Fetches user's trade history from database
2. Gets real historical data for their stocks
3. Queries LinkUp for sentiment on each ticker
4. Queries Fastino for user's behavioral profile
5. Generates and backtests 15 strategy variants
6. Applies behavioral adjustments (position sizing, risk tolerance)
7. Applies sentiment adjustments (market confidence)
8. Returns optimized hybrid strategy

### 3. Behavioral Profile

Extracted from Fastino + trade analysis:

```typescript
interface BehavioralProfile {
  risk_appetite: number;           // 0 to 1
  avg_hold_duration: number;       // days
  preferred_entry_style: string;   // aggressive/conservative/balanced
  win_rate: number;                // 0 to 1
  avg_win_loss_ratio: number;
  position_sizing_preference: number;
  favorite_tickers: string[];
  trading_frequency: string;       // high/medium/low
  insights: string;                // Fastino's analysis
}
```

### 4. Sentiment Analysis

Extracted from LinkUp's market intelligence:

```typescript
interface SentimentAnalysis {
  score: number;          // -1 (bearish) to 1 (bullish)
  confidence: number;     // 0 to 1
  summary: string;        // Human-readable summary
  sources: string[];      // News URLs
}
```

## Setup Instructions

### 1. Get API Keys

#### Alpha Vantage (Recommended for Stock Data)
1. Visit https://www.alphavantage.co/support/#api-key
2. Enter your email to get a free API key
3. Free tier: 5 API calls per minute, 500 per day

#### Finnhub (Alternative Stock Data)
1. Visit https://finnhub.io/register
2. Sign up for free account
3. Free tier: 60 API calls per minute

#### LinkUp (Market Sentiment)
1. Contact LinkUp for API access
2. Add key to environment variables

#### Fastino (Behavioral Learning)
1. Contact Fastino for API access
2. Add key to environment variables

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your keys:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
# Required for real stock data (choose one or both)
ALPHA_VANTAGE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here

# Optional but recommended
LINKUP_API_KEY=your_key_here
FASTINO_API_KEY=your_key_here
```

**Note:** The system will work without API keys by using synthetic data, but real data provides significantly better results.

### 3. Restart Backend

```bash
cd backend
npm run dev
```

## How It Works

### Example Flow

1. **User triggers evolution** from Dashboard
2. **System fetches user's trades** from PostgreSQL
   ```
   Found 45 trades across 20 stocks
   ```

3. **Fetches real market data** for user's stocks
   ```
   📊 Fetching historical data for AAPL, GOOGL, TSLA...
   ✅ Retrieved 252 days of data for AAPL
   ✅ Retrieved 252 days of data for GOOGL
   ✅ Retrieved 252 days of data for TSLA
   ```

4. **Analyzes sentiment** via LinkUp
   ```
   🔍 Fetching sentiment analysis from LinkUp...
   ✅ Sentiment for AAPL: 0.65 (Bullish)
   ✅ Sentiment for GOOGL: 0.32 (Neutral)
   ✅ Sentiment for TSLA: -0.21 (Slightly Bearish)
   ```

5. **Builds behavioral profile** via Fastino
   ```
   🧠 Fetching behavioral profile from Fastino...
   ✅ Behavioral profile created:
      risk_appetite: 0.7
      entry_style: aggressive
      favorite_tickers: AAPL, TSLA, NVDA
   ```

6. **Generates and tests 15 variants**
   ```
   🔬 Generating strategy variants...
   📈 Backtesting variants with real market data...
   ✨ New best strategy found: Sharpe 1.234, Return 23.45%
   ```

7. **Applies adjustments**
   ```
   🧠 Applying behavioral adjustments...
      position_size: 0.280
      rsi_threshold: 25
      ma_short: 12
      ma_long: 48
   
   📰 Applying sentiment-based adjustments...
      avg_sentiment: 0.253
      avg_confidence: 0.785
      final_position_size: 0.300
   ```

8. **Final backtest and save**
   ```
   🎯 Backtesting final evolved strategy...
   ✅ Evolution complete!
      📊 Final Metrics: Sharpe 1.456, Return 28.73%
      📈 Improvement: +0.234 Sharpe, +12.34% Return
   ```

## Testing Without API Keys

The system includes fallback mechanisms:

1. **No Stock API Key**: Uses synthetic realistic data
2. **No LinkUp Key**: Assumes neutral sentiment
3. **No Fastino Key**: Builds profile from trade history only

This allows you to test the full pipeline without external dependencies.

## Performance Considerations

### API Rate Limits

**Alpha Vantage (Free Tier):**
- 5 calls per minute
- 500 calls per day
- System adds 12-second delays between calls

**Finnhub (Free Tier):**
- 60 calls per minute
- No daily limit
- Faster for multiple tickers

**Recommendation:** Start with 3 tickers per evolution to stay within limits.

### Evolution Time

With API calls and backtesting:
- **3 tickers**: ~45 seconds
- **5 tickers**: ~90 seconds
- **10 tickers**: ~3 minutes

The system processes tickers sequentially to respect rate limits.

## Debugging

Enable detailed logging by checking the backend console:

```bash
# You'll see logs like:
📊 Fetching historical data for AAPL...
✅ Retrieved 252 days of data for AAPL
🔍 Fetching sentiment analysis from LinkUp...
✅ Sentiment for AAPL: 0.65
🧠 Fetching behavioral profile from Fastino...
✅ Behavioral profile created
🔬 Generating strategy variants...
📈 Backtesting variants with real market data...
✨ New best strategy found: Sharpe 1.234
```

## Benefits of V2

1. **Real Market Data**: No more synthetic prices, actual historical data
2. **Live Sentiment**: Incorporates current market news and analyst opinions
3. **Personalized**: Adapts to YOUR trading style and preferences
4. **Comprehensive**: Combines quantitative + behavioral + sentiment analysis
5. **Transparent**: Detailed insights explain every adjustment
6. **Fallback Ready**: Works even without API keys for testing

## Next Steps

1. Get at least one stock data API key (Alpha Vantage recommended)
2. Configure `.env` with your keys
3. Restart backend
4. Trigger evolution from Dashboard
5. Watch the console logs for detailed progress
6. Check the insights in the evolution timeline

## Troubleshooting

### "API limit reached"
- Wait for rate limit to reset (1 minute for Alpha Vantage)
- Or switch to Finnhub
- Or use synthetic data temporarily

### "No data available for ticker"
- Check if ticker symbol is correct
- Try a different ticker
- System will use synthetic data as fallback

### "Fastino/LinkUp error"
- Check API keys in `.env`
- System will continue with reduced functionality
- Profile built from trade history only

## Files Modified/Created

- ✅ `backend/src/services/stockData.ts` (NEW)
- ✅ `backend/src/services/evolution_v2.ts` (NEW)
- ✅ `backend/src/routes/index.ts` (UPDATED)
- ✅ `backend/.env.example` (NEW)
- ✅ `EVOLUTION_V2_GUIDE.md` (THIS FILE)

## Conclusion

Evolution V2 represents a complete overhaul of the strategy optimization system, moving from synthetic data to real market intelligence. The system now:

- Fetches real historical stock prices
- Analyzes live market sentiment
- Learns from your personal trading behavior
- Combines all three into a hybrid optimized strategy

This creates strategies that are not just theoretically optimal, but practically aligned with real market conditions and your personal trading style.

