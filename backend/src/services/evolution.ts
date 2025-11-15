import { fastinoService } from './fastino';
import { linkUpService } from './linkup';
import { strategyService, Strategy, StrategyMetrics } from './strategy';

export interface EvolutionEvent {
  id: string;
  type: 'quantitative' | 'behavioral' | 'hybrid';
  old_strategy_id: string;
  new_strategy_id: string;
  improvement: {
    sharpe_delta: number;
    return_delta: number;
  };
  insights: string;
  created_at: Date;
}

class EvolutionService {
  // Evolution Loop 1: Quantitative Optimization
  async optimizeQuantitative(baseStrategy: Strategy): Promise<{ strategy: Strategy; event: EvolutionEvent }> {
    console.log('Starting quantitative optimization...');

    // Generate variants
    const variants = strategyService.generateVariants(baseStrategy, 20);

    // Backtest all variants in parallel
    const marketData = strategyService.generateSampleData(252);
    const results = variants.map((variant) => {
      const metrics = strategyService.backtest(variant, marketData);
      return { ...variant, metrics };
    });

    // Select best performing strategy (by Sharpe ratio)
    const bestStrategy = results.reduce((best, current) =>
      current.metrics!.sharpe_ratio > best.metrics!.sharpe_ratio ? current : best
    );

    const event: EvolutionEvent = {
      id: `evolution_${Date.now()}`,
      type: 'quantitative',
      old_strategy_id: baseStrategy.id,
      new_strategy_id: bestStrategy.id,
      improvement: {
        sharpe_delta: bestStrategy.metrics!.sharpe_ratio - (baseStrategy.metrics?.sharpe_ratio || 0),
        return_delta: bestStrategy.metrics!.total_return - (baseStrategy.metrics?.total_return || 0),
      },
      insights: `Quantitative optimization improved Sharpe ratio from ${baseStrategy.metrics?.sharpe_ratio.toFixed(2)} to ${bestStrategy.metrics!.sharpe_ratio.toFixed(2)} through parameter tuning.`,
      created_at: new Date(),
    };

    console.log('Quantitative optimization complete:', event.insights);

    return { strategy: bestStrategy, event };
  }

  // Evolution Loop 2: Behavioral Learning (via Fastino)
  async learnUserBehavior(userId: string, currentStrategy: Strategy): Promise<{ insights: string; adjustments: any }> {
    console.log('Learning user behavioral patterns...');

    try {
      // Query Fastino for user's trading patterns
      const behaviorQuery = await fastinoService.queryBehavior(
        userId,
        `Analyze this user's trading history and identify:
        1. In what market conditions does the user outperform systematic strategies?
        2. What position sizing patterns has the user exhibited?
        3. When does the user typically override strategy signals, and are those overrides successful?
        4. What are the user's risk management tendencies (early exits, holding winners)?
        `
      );

      // Get user profile summary
      const summary = await fastinoService.getSummary(userId, 500);

      const insights = `
        User Behavioral Insights:
        ${behaviorQuery.answer}
        
        Profile Summary:
        ${summary.summary}
      `;

      // Extract actionable adjustments
      const adjustments = {
        position_sizing_modifier: 1.0, // Will be adjusted based on learned patterns
        risk_management_rules: [],
        override_conditions: [],
      };

      console.log('Behavioral learning complete');

      return { insights, adjustments };
    } catch (error) {
      console.error('Behavioral learning error:', error);
      return {
        insights: 'Insufficient user data for behavioral learning. Continue trading to build profile.',
        adjustments: {},
      };
    }
  }

  // Evolution Loop 3: Contextual Intelligence (via LinkUp)
  async getMarketContext(ticker?: string): Promise<{ context: string; sentiment: string }> {
    console.log('Fetching real-time market intelligence...');

    try {
      // Get macro events
      const macroEvents = await linkUpService.getMacroEvents();

      // Get ticker-specific news if provided
      let tickerNews = null;
      if (ticker) {
        tickerNews = await linkUpService.getTickerNews(ticker, 7);
      }

      const context = `
        Market Context:
        
        Macro Environment:
        ${macroEvents.answer}
        
        ${ticker ? `${ticker} Specific News:\n${tickerNews?.answer}` : ''}
      `;

      // Simple sentiment extraction
      const sentiment = macroEvents.answer.toLowerCase().includes('positive') ||
        macroEvents.answer.toLowerCase().includes('bullish')
        ? 'positive'
        : macroEvents.answer.toLowerCase().includes('negative') ||
          macroEvents.answer.toLowerCase().includes('bearish')
        ? 'negative'
        : 'neutral';

      console.log('Market context retrieved');

      return { context, sentiment };
    } catch (error) {
      console.error('Market context error:', error);
      return {
        context: 'Market context unavailable',
        sentiment: 'neutral',
      };
    }
  }

  // Master synthesis: Combine all three evolution loops
  async synthesizeHybridStrategy(
    userId: string,
    baseStrategy: Strategy,
    optimizedStrategy: Strategy
  ): Promise<{ strategy: Strategy; event: EvolutionEvent }> {
    console.log('Synthesizing hybrid strategy...');

    // 1. Get user behavioral insights
    const { insights: behaviorInsights, adjustments } = await this.learnUserBehavior(userId, optimizedStrategy);

    // 2. Get market context
    const { context: marketContext, sentiment } = await this.getMarketContext();

    // 3. Create hybrid strategy
    const hybridStrategy: Strategy = {
      id: `hybrid_${Date.now()}`,
      name: 'Hybrid Strategy (Evolved)',
      type: 'hybrid',
      parameters: {
        ...optimizedStrategy.parameters,
        // Apply behavioral adjustments
        position_size: optimizedStrategy.parameters.position_size * (adjustments.position_sizing_modifier || 1.0),
      },
      metrics: optimizedStrategy.metrics, // Will be backtested again
      created_at: new Date(),
      parent_id: optimizedStrategy.id,
    };

    // Backtest hybrid strategy
    const marketData = strategyService.generateSampleData(252);
    hybridStrategy.metrics = strategyService.backtest(hybridStrategy, marketData);

    const event: EvolutionEvent = {
      id: `evolution_${Date.now()}`,
      type: 'hybrid',
      old_strategy_id: baseStrategy.id,
      new_strategy_id: hybridStrategy.id,
      improvement: {
        sharpe_delta: hybridStrategy.metrics!.sharpe_ratio - (baseStrategy.metrics?.sharpe_ratio || 0),
        return_delta: hybridStrategy.metrics!.total_return - (baseStrategy.metrics?.total_return || 0),
      },
      insights: `
        Hybrid strategy evolved by combining:
        1. Quantitative optimization (Sharpe: ${optimizedStrategy.metrics?.sharpe_ratio.toFixed(2)})
        2. User behavioral patterns: ${behaviorInsights.substring(0, 200)}...
        3. Current market context: ${sentiment} sentiment
        
        Result: Sharpe ${hybridStrategy.metrics!.sharpe_ratio.toFixed(2)}, Return ${hybridStrategy.metrics!.total_return.toFixed(2)}%
      `,
      created_at: new Date(),
    };

    console.log('Hybrid strategy synthesis complete');

    return { strategy: hybridStrategy, event };
  }

  // Full evolution cycle: Run all three loops
  async evolveStrategy(userId: string, baseStrategy: Strategy): Promise<{
    finalStrategy: Strategy;
    events: EvolutionEvent[];
  }> {
    console.log('=== Starting Full Evolution Cycle ===');

    const events: EvolutionEvent[] = [];

    // Step 1: Quantitative optimization
    const { strategy: optimizedStrategy, event: quantEvent } = await this.optimizeQuantitative(baseStrategy);
    events.push(quantEvent);

    // Step 2: Synthesize with behavioral and contextual data
    const { strategy: hybridStrategy, event: hybridEvent } = await this.synthesizeHybridStrategy(
      userId,
      baseStrategy,
      optimizedStrategy
    );
    events.push(hybridEvent);

    console.log('=== Evolution Cycle Complete ===');
    console.log(`Base Strategy Sharpe: ${baseStrategy.metrics?.sharpe_ratio.toFixed(2)}`);
    console.log(`Final Strategy Sharpe: ${hybridStrategy.metrics?.sharpe_ratio.toFixed(2)}`);
    console.log(`Improvement: +${((hybridStrategy.metrics!.sharpe_ratio - (baseStrategy.metrics?.sharpe_ratio || 0)) / (baseStrategy.metrics?.sharpe_ratio || 1) * 100).toFixed(1)}%`);

    return {
      finalStrategy: hybridStrategy,
      events,
    };
  }
}

export const evolutionService = new EvolutionService();

