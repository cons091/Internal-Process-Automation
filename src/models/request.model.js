const pool = require('../config/db');

const RequestModel = {
  create: async ({ type, description, amount, status, created_by }) => {
    const query = `
      INSERT INTO requests (type, description, amount, status, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [type, description, amount, status, created_by];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async (page = 1, limit = 10) => {
    // Calcular el desplazamiento
    const offset = (page - 1) * limit;

    // Query para obtener los DATOS de la página actual
    const dataQuery = `
      SELECT r.id, r.type, r.description, r.status, r.amount, r.created_at, u.name as user_name
      FROM requests r
      LEFT JOIN users u ON r.created_by = u.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    // Query para contar el TOTAL de registros
    const countQuery = `SELECT COUNT(*) FROM requests`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [limit, offset]),
      pool.query(countQuery)
    ]);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit)
    };
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
