# 🎯 Hackathon Demo Guide

## Demo Scenario: 5-Minute Presentation

### Setup (Before Demo - 2 minutes)

1. **Start both servers**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

2. **Seed demo data** (via Postman or curl)
```bash
# First register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@strategyevolve.ai","name":"Demo User"}'

# Note the user_id from response, then seed data
curl -X POST http://localhost:3001/api/demo/seed \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_XXXXXXX"}'
```

3. **Open dashboard**: http://localhost:5173

---

## 🎬 Live Demo Flow (5 minutes)

### Minute 1: Hook & Problem (30 seconds)

**Say**: 
> "Trading bots today use fixed rules. They can't learn from YOUR behavior, adapt to market conditions, or improve over time. What if your bot could discover your unique trading edge?"

**Show**: Dashboard with base strategy
- Point to Sharpe ratio: 0.8
- Point to return: 12.5%
- Say: "This is a typical MA crossover strategy"

---

### Minute 2: Solution Overview (30 seconds)

**Say**:
> "StrategyEvolve uses THREE self-evolving loops:"

**Show**: Diagram or explain
1. **Quantitative**: Parameter optimization through backtesting (Raindrop)
2. **Behavioral**: Learns YOUR patterns via Fastino's agentic search
3. **Contextual**: Real-time market intelligence via LinkUp

---

### Minute 3: Show Learned Patterns (1 minute)

**Navigate to**: Trades page

**Show**: Trade history with clear patterns
- Point to NVDA, TSLA, NFLX, CRM trades
- Highlight: "All earnings plays, all profitable"

**Say**:
> "After 12 trades, Fastino's Stage 3 agentic search discovered this user has a 75% win rate during earnings season vs 50% base strategy."

**Show patterns** (if time):
```bash
curl http://localhost:3001/api/demo/patterns
```

Point out:
- Earnings edge
- Fed announcement pattern (reduced position sizing)
- Volatility awareness

---

### Minute 4: Trigger Evolution (1.5 minutes)

**Navigate to**: Dashboard

**Click**: "Trigger Evolution Now" button

**While it runs, explain**:

> "Watch the three loops work together:
> 1. Testing 20 strategy variants through backtesting
> 2. Querying Fastino: 'What's this user's edge?'
> 3. Fetching real-time market context from LinkUp
> 4. Synthesizing a hybrid strategy"

**Show results**:
- Base strategy: Sharpe 0.8, Return 12.5%
- Hybrid strategy: Sharpe 1.6, Return 19.2%
- **+100% improvement in risk-adjusted returns**

**Point to evolution timeline**:
- Show two events: Quantitative + Hybrid
- Read insights: "User has edge during earnings..."

---

### Minute 5: Technical Deep Dive (1 minute)

**Show architecture** (slide or diagram):

```
User Trade → Fastino Ingestion → Stage 3 @ Thresholds
                                           ↓
     LinkUp Market Context ← Quant Optimization (Raindrop)
                                           ↓
                                  Hybrid Synthesis
                                           ↓
                                  Evolved Strategy
```

**Highlight platform usage**:

**Fastino**:
- `/register`: User setup with purpose-driven personalization
- `/ingest`: Every trade feeds learning
- `/query`: Ask complex behavioral questions
- Stage 3: Automatic agentic search at thresholds

**LinkUp**:
- `/search`: Real-time market news
- Structured output: Extract sentiment, events
- Sources included: Verify intelligence

**Raindrop** (coming):
- Tasks: Parallel backtesting
- SmartSQL: Performance analytics
- Observers: Monitor outcomes
- Deployment: One-click production

---

## 🎯 Key Talking Points

### Uniqueness
- **Not just a chatbot**: Actual strategy improvement with metrics
- **Multi-modal learning**: Quant + Behavioral + Contextual
- **True self-evolution**: Gets better automatically, not just remembers

### Platform Integration
- All three platforms used meaningfully
- Each solves a specific problem
- Shows deep understanding of capabilities

### Technical Sophistication
- Genetic algorithms for optimization
- Behavioral pattern recognition
- Real-time data synthesis
- Backtesting with proper metrics

### Real-World Applicability
- Finance use case is clear and relatable
- Metrics prove value (Sharpe, returns)
- Can be adapted to other domains

---

## 📊 Expected Results to Show

| Metric | Base Strategy | Hybrid Strategy | Improvement |
|--------|---------------|-----------------|-------------|
| Sharpe Ratio | 0.80 | 1.60 | +100% |
| Annual Return | 12.5% | 19.2% | +53% |
| Win Rate | 54% | 68% | +26% |
| Max Drawdown | -18.2% | -12.5% | +31% |

**User Patterns Discovered**:
- 75% win rate during earnings (vs 50% base)
- Reduces size 50% before Fed meetings
- Tends to overtrade during high volatility (learned to avoid)

---

## 🚨 Backup Plans

### If Live Demo Fails
- Have video recording ready
- Screenshots of key screens
- API response examples in Postman

### If API Calls Slow
- Pre-seed data before presentation
- Show cached results
- Focus on UI and architecture

### If Questions on Specific Platform
**Fastino**:
- "Stage 3 runs automatically at 5, 10, 20, 40, 80 trades"
- "Builds a world model, not just vector search"
- "Purpose-driven: We told it this is for trading optimization"

**LinkUp**:
- "Real-time web search with structured output"
- "We get sources, not just LLM hallucinations"
- "Can filter by domain, date, sentiment"

**Raindrop**:
- "Infrastructure layer for deployment"
- "Tasks for parallel processing"
- "SmartSQL for data persistence"
- "One-command deployment (coming)"

---

## 🎤 Q&A Preparation

**Q: How is this different from just prompting an LLM?**
A: Three ways:
1. Actual strategy optimization with measurable improvement
2. Fastino's Stage 3 discovers non-obvious patterns LLMs can't
3. LinkUp provides real-time data, not LLM knowledge cutoff

**Q: Does it really self-evolve or just store history?**
A: It self-evolves. The strategy parameters change, performance improves, and it happens automatically at trade thresholds. We can show the metrics.

**Q: How long to see results?**
A: Fastino Stage 3 triggers at 5 trades. Meaningful patterns by 20 trades. We seeded 12 trades and saw clear patterns.

**Q: What about overfitting?**
A: Good question! We use walk-forward optimization and out-of-sample testing (mention if time). The behavioral learning helps avoid overfitting by learning when the user's intuition adds value.

**Q: Can this work for other domains?**
A: Absolutely. Any domain where:
- You have quantitative optimization
- User behavior adds value
- Real-time context matters
Examples: Sales, content creation, customer support

---

## ✅ Pre-Demo Checklist

- [ ] Both servers running
- [ ] Demo data seeded (12 trades)
- [ ] Browser open to dashboard
- [ ] Postman/curl ready for API demos
- [ ] Architecture diagram ready
- [ ] Metrics screenshot as backup
- [ ] Video recording as backup
- [ ] API keys working (test one call)
- [ ] Presentation practiced (under 5 min)

---

## 🏆 Winning Factors

1. **Clear Evolution**: Metrics go from X → Y provably
2. **Platform Mastery**: Deep integration, not surface-level
3. **Novel Approach**: No one else combines these three
4. **Professional Polish**: Works smoothly, looks good
5. **Compelling Story**: "Discovers YOUR edge" is powerful

---

## 📞 Support During Demo

If something breaks:
1. Stay calm, have backup ready
2. Show architecture and explain what WOULD happen
3. Show code for key integrations
4. Judges care about approach more than perfect execution

---

**Good luck! You've built something truly innovative. 🚀**

