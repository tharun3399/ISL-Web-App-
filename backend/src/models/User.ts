import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  password_hash: string;
}

export class UserModel {
  static async findById(id: number): Promise<UserInfo | null> {
    const text = 'SELECT * FROM userinfo WHERE id = $1';
    const res = await query(text, [id]);
    return res.rows.length ? res.rows[0] : null;
  }

  static async findByEmail(email: string): Promise<UserInfo | null> {
    const text = 'SELECT * FROM userinfo WHERE email = $1';
    const res = await query(text, [email]);
    return res.rows.length ? res.rows[0] : null;
  }

  static async create(
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<UserInfo> {
    const passwordHash = await hashPassword(password);
    const text = `
      INSERT INTO userinfo (name, email, phone, password, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, password, password_hash;
    `;
    const res = await query(text, [name, email, phone, password, passwordHash]);
    return res.rows[0];
  }

  static async validatePassword(
    email: string,
    password: string
  ): Promise<UserInfo | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password_hash);
    return isValid ? user : null;
  }

  static async getAll(): Promise<UserInfo[]> {
    const text = 'SELECT id, name, email, phone FROM userinfo ORDER BY id DESC';
    const res = await query(text);
    return res.rows;
  }

  static async update(
    id: number,
    updates: Partial<UserInfo>
  ): Promise<UserInfo | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'password_hash') {
        if (key === 'password') {
          continue; // Skip plain password, use password_hash
        }
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const text = `
      UPDATE userinfo
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, password, password_hash;
    `;
    const res = await query(text, values);
    return res.rows.length ? res.rows[0] : null;
  }

  static async delete(id: number): Promise<boolean> {
    const text = 'DELETE FROM userinfo WHERE id = $1 RETURNING id';
    const res = await query(text, [id]);
    return res.rows.length > 0;
  }
}
