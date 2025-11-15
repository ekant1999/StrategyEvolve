# 🚀 Quick Start Guide

## Prerequisites

You'll need API keys from:
1. **Fastino**: https://fastino.ai (for behavioral learning)
2. **LinkUp**: https://linkup.so (for market intelligence)
3. **LiquidMetal**: https://liquidmetal.run (for Raindrop deployment - optional for local dev)

## Setup Instructions

### 1. Configure API Keys

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys:
# - FASTINO_API_KEY=your_key_here
# - LINKUP_API_KEY=your_key_here
# - LM_API_KEY=your_key_here (optional for local dev)
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Should already have: VITE_API_URL=http://localhost:3001/api
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 StrategyEvolve Backend Server 🚀
Server running on: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE ready in X ms

  ➜  Local:   http://localhost:5173/
```

### 4. Open the App

Visit: http://localhost:5173

## Testing the Application

### 1. Register a User
The app should load automatically. If you need to test the API directly:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Log a Trade
Use the UI or:

```bash
curl -X POST http://localhost:3001/api/trades \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_xxx",
    "ticker": "TSLA",
    "action": "BUY",
    "quantity": 100,
    "price": 250.00,
    "strategy_signal": "MA crossover bullish + RSI oversold",
    "user_reasoning": "Strong earnings momentum, institutional buying"
  }'
```

### 3. Trigger Evolution
Use the UI button or:

```bash
curl -X POST http://localhost:3001/api/evolution/synthesize \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_xxx"}'
```

## Key Features to Demo

### 1. Dashboard
- View real-time strategy metrics
- See evolution timeline
- Track improvement over time

### 2. Trade Logging
- Log manual trades
- Add reasoning for each trade
- Fastino automatically ingests and learns patterns

### 3. Strategy Evolution
- Click "Trigger Evolution Now"
- Watch the three evolution loops work:
  - Quantitative optimization (parameter tuning)
  - Behavioral learning (Fastino patterns)
  - Market context (LinkUp intelligence)

### 4. Behavioral Insights
- After 5+ trades, query Fastino for learned patterns
- See Stage 3 agentic search results

## API Endpoints

```
Auth:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/user/:userId/profile

Strategies:
  GET    /api/strategies
  POST   /api/strategies/generate
  POST   /api/strategies/backtest

Evolution:
  POST   /api/evolution/optimize
  POST   /api/evolution/synthesize
  GET    /api/evolution/history

Trades:
  GET    /api/trades
  POST   /api/trades
  GET    /api/trades/:id/outcome

Market:
  POST   /api/market/news
  POST   /api/market/sentiment
  POST   /api/market/macro

Insights:
  POST   /api/insights/query
  POST   /api/insights/chunks
```

## Troubleshooting

### Backend won't start
- Check API keys are set in `.env`
- Make sure port 3001 is available
- Run `npm install` again

### Frontend won't connect
- Verify backend is running on port 3001
- Check CORS settings if needed
- Clear browser cache

### Fastino errors
- Verify API key is correct
- User needs 5+ trades for Stage 3 to trigger
- Some features require time to build profile

### LinkUp errors
- Verify API key is correct
- Check rate limits
- LinkUp requires internet connection

## Next Steps

1. **Seed Demo Data**: Create script to add 30 sample trades
2. **Deploy to Raindrop**: Follow Raindrop deployment guide
3. **Customize Strategies**: Add your own strategy types
4. **Enhance UI**: Add more visualizations

## Project Structure

```
strategy-evolve/
├── frontend/          # React + TypeScript UI
├── backend/           # Express API
├── README.md          # Full documentation
├── PROJECT_PLAN.md    # Detailed plan
└── QUICKSTART.md      # This file
```

## Need Help?

- Check README.md for full documentation
- Review PROJECT_PLAN.md for architecture details
- Look at API routes in `backend/src/routes/index.ts`

---

**🎉 You're ready to build a self-evolving trading agent!**

