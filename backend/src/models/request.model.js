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

  findAll: async (page = 1, limit = 10, userId = null) => {
    const offset = (page - 1) * limit;

    let dataQuery, countQuery, queryParams, countParams;

    if (userId) {
      dataQuery = `
        SELECT r.id, r.type, r.description, r.status, r.amount, r.created_at, u.name as user_name
        FROM requests r
        LEFT JOIN users u ON r.created_by = u.id
        WHERE r.created_by = $3  -- Filtramos por ID
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      countQuery = `SELECT COUNT(*) FROM requests WHERE created_by = $1`;
      
      queryParams = [limit, offset, userId];
      countParams = [userId];

    } else {
      dataQuery = `
        SELECT r.id, r.type, r.description, r.status, r.amount, r.created_at, u.name as user_name
        FROM requests r
        LEFT JOIN users u ON r.created_by = u.id
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      countQuery = `SELECT COUNT(*) FROM requests`;
      
      queryParams = [limit, offset];
      countParams = [];
    }

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, queryParams),
      pool.query(countQuery, countParams)
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
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  },

  findById: async (id) => {
    const query = `
      SELECT id, status, created_by
      FROM requests
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

module.exports = RequestModel;