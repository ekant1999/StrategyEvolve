# 🚀 StrategyEvolve - Self-Optimizing Trading Strategy Agent

**A self-evolving AI trading agent that learns from quantitative optimization, user behavior, and real-time market intelligence.**

Built for the [Self-Evolving Agents Hackathon](https://luma.com/agentshack) using LiquidMetal Raindrop, Fastino AI, and LinkUp.

---

## 🎯 Project Vision

Most trading bots use static rules and fixed parameters. **StrategyEvolve** is different:

- 🧠 **Learns YOUR unique trading edge** from your decisions and outcomes
- 📊 **Optimizes strategies** through continuous backtesting and evolution
- 🌐 **Stays current** with real-time market news and context
- 🔄 **Self-improves** through three independent evolution loops

## 🏗️ Architecture

### Three Evolution Loops

```
┌─────────────────────────────────────────────────────────────┐
│                  EVOLUTION LOOPS                             │
├─────────────────────────────────────────────────────────────┤
│  Loop 1: Quantitative Optimization (Raindrop)               │
│  • Generate strategy variants                                │
│  • Parallel backtesting                                      │
│  • Performance metrics & selection                           │
│                                                              │
│  Loop 2: Behavioral Learning (Fastino)                      │
│  • Ingest user trades & decisions                           │
│  • Stage 3 agentic search discovers patterns                │
│  • Learn user's unique trading edge                         │
│                                                              │
│  Loop 3: Contextual Intelligence (LinkUp)                   │
│  • Real-time market news & sentiment                        │
│  • Earnings & macro event detection                         │
│  • Context-aware decision making                            │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite for blazing fast dev experience
- TailwindCSS for modern UI
- Recharts for data visualization
- Zustand for state management

**Backend:**
- Node.js + Express
- TypeScript
- PostgreSQL (via Raindrop SmartSQL) ✅

**AI/ML Platforms:**
- [Raindrop](https://docs.liquidmetal.ai/) - Infrastructure, parallel tasks, SmartSQL database, observers ✅
- [Fastino](https://fastino.ai/) - User behavioral learning & personalization
- [LinkUp](https://linkup.so/) - Real-time market intelligence

---

## 🌟 Key Features

### 1. **Strategy Optimization Engine**
- Genetic algorithm-based parameter tuning
- Parallel backtesting via Raindrop Tasks (10x faster) ✅
- Performance metrics: Sharpe ratio, returns, drawdown, win rate

### 2. **Behavioral Learning System**
- Captures user trades, overrides, and reasoning
- Fastino Stage 3 discovers non-obvious patterns
- Learns user's emotional triggers and risk tolerance

### 3. **Market Intelligence Layer**
- Real-time news and sentiment via LinkUp
- Earnings and macro event detection
- Context-aware signal enhancement

### 4. **Hybrid Strategy Synthesis**
- Combines quantitative optimization with user behavioral patterns
- Blends systematic signals with human intuition
- Adaptive position sizing based on learned preferences

### 5. **Evolution Dashboard**
- Real-time visualization of strategy evolution
- Performance metrics over time
- User behavioral insights
- Market context integration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- LiquidMetal API Key ([Get one here](https://liquidmetal.run))
- Fastino API Key ([Get one here](https://fastino.ai))
- LinkUp API Key ([Get one here](https://linkup.so))

### Installation

```bash
# Navigate to project
cd strategy-evolve

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development
npm run dev
```

### Environment Variables

```env
# LiquidMetal Raindrop
LM_API_KEY=your_liquidmetal_api_key

# Fastino
FASTINO_API_KEY=your_fastino_api_key

# LinkUp
LINKUP_API_KEY=your_linkup_api_key

# Server
PORT=3001
NODE_ENV=development
```

---

## 📁 Project Structure

```
strategy-evolve/
├── frontend/                 # React + TypeScript UI
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── fastino.ts   # Fastino integration
│   │   │   ├── linkup.ts    # LinkUp integration
│   │   │   ├── raindrop.ts  # Raindrop integration
│   │   │   ├── strategy.ts  # Strategy engine
│   │   │   └── evolution.ts # Evolution logic
│   │   ├── models/          # Data models
│   │   └── utils/           # Utilities
│   └── package.json
│
├── docs/                    # Documentation
│   └── PROJECT_PLAN.md      # Detailed project plan
│
└── README.md
```

---

## 🏆 Hackathon Advantages

### 1. **True Self-Evolution**
- Not just memory - actual strategy improvement
- Three independent learning loops
- Quantifiable metrics showing evolution

### 2. **Perfect Platform Utilization**
- **Raindrop**: Tasks, Queues, SmartSQL, Observers, deployment
- **Fastino**: Register, ingest, Stage 3, query, chunks - all features used meaningfully
- **LinkUp**: Real-time intelligence, structured output, sourced answers

### 3. **Novel Approach**
- First to combine quant optimization + behavioral learning + real-time context
- Goes beyond typical "chatbot with memory"
- Shows deep understanding of each platform's strengths

### 4. **Compelling Demo**
- Clear before/after metrics
- Live evolution visible in real-time
- Relatable use case (trading)
- Professional UI

---

## 📚 Resources

- [Raindrop Documentation](https://docs.liquidmetal.ai/)
- [Fastino Documentation](https://fastino.ai/docs/overview)
- [LinkUp API Reference](https://docs.linkup.so/)
- [Hackathon Details](https://luma.com/agentshack)

---

## 📝 License

MIT License
![WhatsApp Image 2025-11-15 at 16 44 42](https://github.com/user-attachments/assets/dcb4e41a-a7a8-4a13-9f4d-1ad0f7297cf5)
![WhatsApp Image 2025-11-15 at 16 45 19](https://github.com/user-attachments/assets/08b4be3f-590e-445f-bdc1-04b0fca8e02f)


Built with ❤️ for the Self-Evolving Agents Hackathon

**Let's show the world what true self-evolving agents can do!**

