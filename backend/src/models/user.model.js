const db = require('../config/db');

class UserModel {

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async create({ name, email, password, role }) {
    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;
    const result = await db.query(query, [name, email, password, role]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, role FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = UserModel;