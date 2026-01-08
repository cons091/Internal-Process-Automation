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
  
  updateStatus: async (id, status, changedBy, reason = null) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Obtener estado anterior
      const oldReqRes = await client.query('SELECT status FROM requests WHERE id = $1', [id]);
      const previousStatus = oldReqRes.rows[0]?.status;

      // 2. Actualizar solicitud
      const updateQuery = `
        UPDATE requests
        SET status = $1
        WHERE id = $2
        RETURNING *
      `;
      const { rows } = await client.query(updateQuery, [status, id]);
      const updatedRequest = rows[0];

      // 3. Insertar historial con REASON y CHANGED_AT explícito
      const historyQuery = `
        INSERT INTO request_status_history 
        (request_id, previous_status, new_status, changed_by, changed_at, reason)
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `;
      // Si reason es undefined o null, se guarda como null en DB (o string vacío si prefieres)
      const reasonToSave = reason || 'Actualización manual';
      
      await client.query(historyQuery, [id, previousStatus, status, changedBy, reasonToSave]);

      await client.query('COMMIT');
      return updatedRequest;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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

getHistory: async (requestId) => {
    const query = `
      SELECT 
        h.id,
        h.new_status as status,
        h.previous_status,
        h.reason,
        h.changed_at,
        u.name as changed_by_name,
        u.role as changed_by_role
      FROM request_status_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.request_id = $1
      ORDER BY h.changed_at DESC
    `;
    const { rows } = await pool.query(query, [requestId]);
    return rows;
  }
};

module.exports = RequestModel;