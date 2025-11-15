import { query } from './db';
import type { Trade, TradeOutcome } from './types';

export const tradeModel = {
  async create(trade: Omit<Trade, 'id' | 'created_at'> & { id?: string; created_at?: Date }): Promise<Trade> {
    const tradeId = trade.id || `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = trade.created_at || new Date();

    const result = await query(
      `INSERT INTO trades (id, user_id, ticker, action, quantity, price, strategy_signal, user_reasoning, market_context, outcome, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        tradeId,
        trade.user_id,
        trade.ticker,
        trade.action,
        trade.quantity,
        trade.price,
        trade.strategy_signal || null,
        trade.user_reasoning || null,
        trade.market_context || null,
        trade.outcome ? JSON.stringify(trade.outcome) : null,
        createdAt,
      ]
    );
    return this.mapRowToTrade(result.rows[0]);
  },

  async findById(id: string): Promise<Trade | null> {
    const result = await query('SELECT * FROM trades WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToTrade(result.rows[0]);
  },

  async findByUserId(userId: string): Promise<Trade[]> {
    const result = await query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map((row) => this.mapRowToTrade(row));
  },

  async findByUser(userId: string): Promise<Trade[]> {
    // Alias for findByUserId for compatibility
    return this.findByUserId(userId);
  },

  async findAll(): Promise<Trade[]> {
    const result = await query('SELECT * FROM trades ORDER BY created_at DESC');
    return result.rows.map((row) => this.mapRowToTrade(row));
  },

  async update(id: string, updates: Partial<Trade>): Promise<Trade | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.outcome !== undefined) {
      fields.push(`outcome = $${paramCount++}`);
      values.push(JSON.stringify(updates.outcome));
    }
    if (updates.user_reasoning !== undefined) {
      fields.push(`user_reasoning = $${paramCount++}`);
      values.push(updates.user_reasoning);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE trades SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapRowToTrade(result.rows[0]) : null;
  },

  mapRowToTrade(row: any): Trade {
    return {
      id: row.id,
      user_id: row.user_id,
      ticker: row.ticker,
      action: row.action as 'BUY' | 'SELL',
      quantity: parseInt(row.quantity),
      price: parseFloat(row.price),
      strategy_signal: row.strategy_signal,
      user_reasoning: row.user_reasoning,
      market_context: row.market_context,
      outcome: row.outcome ? (typeof row.outcome === 'string' ? JSON.parse(row.outcome) : row.outcome) : undefined,
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    };
  },
};

