import { query } from './db';

export interface User {
  id: string;
  email: string;
  name?: string;
  fastino_user_id?: string;
  profile_summary?: string;
  created_at: Date;
}

export const userModel = {
  async create(user: User): Promise<User> {
    const result = await query(
      `INSERT INTO users (id, email, name, fastino_user_id, profile_summary, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, user.email, user.name || null, user.fastino_user_id || null, user.profile_summary || null, user.created_at]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.profile_summary !== undefined) {
      fields.push(`profile_summary = $${paramCount++}`);
      values.push(updates.profile_summary);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },
};

