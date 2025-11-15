import { query } from './db';
import type { Strategy, StrategyParameters, StrategyMetrics } from '../services/strategy';

export const strategyModel = {
  async create(strategy: Strategy): Promise<Strategy> {
    const result = await query(
      `INSERT INTO strategies (id, user_id, name, type, parameters, metrics, parent_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        strategy.id,
        strategy.user_id || null,
        strategy.name,
        strategy.type,
        JSON.stringify(strategy.parameters),
        strategy.metrics ? JSON.stringify(strategy.metrics) : null,
        strategy.parent_id || null,
        strategy.created_at,
      ]
    );
    return this.mapRowToStrategy(result.rows[0]);
  },

  async findById(id: string): Promise<Strategy | null> {
    const result = await query('SELECT * FROM strategies WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToStrategy(result.rows[0]);
  },

  async findAll(): Promise<Strategy[]> {
    const result = await query('SELECT * FROM strategies ORDER BY created_at DESC');
    return result.rows.map((row) => this.mapRowToStrategy(row));
  },

  async findByType(type: string): Promise<Strategy[]> {
    const result = await query('SELECT * FROM strategies WHERE type = $1 ORDER BY created_at DESC', [type]);
    return result.rows.map((row) => this.mapRowToStrategy(row));
  },

  async findByUser(userId: string): Promise<Strategy[]> {
    const result = await query(
      'SELECT * FROM strategies WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map((row) => this.mapRowToStrategy(row));
  },

  async findBaseByUser(userId: string): Promise<Strategy | null> {
    const result = await query(
      'SELECT * FROM strategies WHERE user_id = $1 AND type = $2 ORDER BY created_at ASC LIMIT 1',
      [userId, 'base']
    );
    if (result.rows.length === 0) return null;
    return this.mapRowToStrategy(result.rows[0]);
  },

  async update(id: string, updates: Partial<Strategy>): Promise<Strategy | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.parameters !== undefined) {
      fields.push(`parameters = $${paramCount++}`);
      values.push(JSON.stringify(updates.parameters));
    }
    if (updates.metrics !== undefined) {
      fields.push(`metrics = $${paramCount++}`);
      values.push(JSON.stringify(updates.metrics));
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE strategies SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapRowToStrategy(result.rows[0]) : null;
  },

  mapRowToStrategy(row: any): Strategy {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      type: row.type as 'base' | 'optimized' | 'hybrid',
      parameters: typeof row.parameters === 'string' ? JSON.parse(row.parameters) : row.parameters,
      metrics: row.metrics ? (typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics) : undefined,
      parent_id: row.parent_id,
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    };
  },
};

