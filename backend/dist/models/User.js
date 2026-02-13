"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
class UserModel {
    static async findById(id) {
        const text = 'SELECT * FROM userinfo WHERE id = $1';
        const res = await (0, database_1.query)(text, [id]);
        return res.rows.length ? res.rows[0] : null;
    }
    static async findByEmail(email) {
        const text = 'SELECT * FROM userinfo WHERE email = $1';
        const res = await (0, database_1.query)(text, [email]);
        return res.rows.length ? res.rows[0] : null;
    }
    static async create(name, email, phone, password) {
        const passwordHash = await (0, password_1.hashPassword)(password);
        const text = `
      INSERT INTO userinfo (name, email, phone, password, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, password, password_hash;
    `;
        const res = await (0, database_1.query)(text, [name, email, phone, password, passwordHash]);
        return res.rows[0];
    }
    static async validatePassword(email, password) {
        const user = await this.findByEmail(email);
        if (!user)
            return null;
        const isValid = await (0, password_1.comparePassword)(password, user.password_hash);
        return isValid ? user : null;
    }
    static async getAll() {
        const text = 'SELECT id, name, email, phone FROM userinfo ORDER BY id DESC';
        const res = await (0, database_1.query)(text);
        return res.rows;
    }
    static async update(id, updates) {
        const fields = [];
        const values = [];
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
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        const text = `
      UPDATE userinfo
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, password, password_hash;
    `;
        const res = await (0, database_1.query)(text, values);
        return res.rows.length ? res.rows[0] : null;
    }
    static async delete(id) {
        const text = 'DELETE FROM userinfo WHERE id = $1 RETURNING id';
        const res = await (0, database_1.query)(text, [id]);
        return res.rows.length > 0;
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map