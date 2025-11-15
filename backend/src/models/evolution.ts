import { query } from './db';
import type { EvolutionEvent } from '../services/evolution';

export const evolutionModel = {
  async create(event: EvolutionEvent): Promise<EvolutionEvent> {
    const result = await query(
      `INSERT INTO evolution_events (id, type, old_strategy_id, new_strategy_id, improvement, insights, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        event.id,
        event.type,
        event.old_strategy_id,
        event.new_strategy_id,
        JSON.stringify(event.improvement),
        event.insights || null,
        event.created_at,
      ]
    );
    return this.mapRowToEvent(result.rows[0]);
  },

  async findById(id: string): Promise<EvolutionEvent | null> {
    const result = await query('SELECT * FROM evolution_events WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEvent(result.rows[0]);
  },

  async findAll(): Promise<EvolutionEvent[]> {
    const result = await query('SELECT * FROM evolution_events ORDER BY created_at DESC');
    return result.rows.map((row) => this.mapRowToEvent(row));
  },

  async findByStrategyId(strategyId: string): Promise<EvolutionEvent[]> {
    const result = await query(
      'SELECT * FROM evolution_events WHERE old_strategy_id = $1 OR new_strategy_id = $1 ORDER BY created_at DESC',
      [strategyId]
    );
    return result.rows.map((row) => this.mapRowToEvent(row));
  },

  async findByUser(userId: string): Promise<EvolutionEvent[]> {
    // Get evolution events where the strategies belong to the user
    const result = await query(
      `SELECT DISTINCT e.* FROM evolution_events e
       JOIN strategies s ON (e.old_strategy_id = s.id OR e.new_strategy_id = s.id)
       WHERE s.user_id = $1
       ORDER BY e.created_at DESC`,
      [userId]
    );
    return result.rows.map((row) => this.mapRowToEvent(row));
  },

  mapRowToEvent(row: any): EvolutionEvent {
    return {
      id: row.id,
      type: row.type as 'quantitative' | 'behavioral' | 'hybrid',
      old_strategy_id: row.old_strategy_id,
      new_strategy_id: row.new_strategy_id,
      improvement: typeof row.improvement === 'string' ? JSON.parse(row.improvement) : row.improvement,
      insights: row.insights,
      created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    };
  },
};

