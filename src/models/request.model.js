const pool = require('../config/db');

const RequestModel = {
  create: async ({ type, description }) => {
    const query = `
      INSERT INTO requests (type, description)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [type, description];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const query = `
      SELECT id, type, description, status, created_at
      FROM requests
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  updateStatus: async (id, status) => {
   const query = `
      UPDATE requests
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const values = [status, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findById: async (id) => {
   const query = `
      SELECT id, status
      FROM requests
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

};

module.exports = RequestModel;
