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

  findAll: async (page = 1, limit = 10, userId = null, search = null, status = null, type = null) => {
    const offset = (page - 1) * limit;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // ** FILTRO ROL DE USUARIO
    if (userId) {
      conditions.push(`r.created_by = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    // ** FILTRO DE BUSQUEDA POR NOMBRE O EMAIL
    if (search) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // ** FILTRO DE ESTADO DE SOLICITUD
    if (status && status !== 'ALL') {
      conditions.push(`r.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // ** FILTRO TIPO DE SOLICITUD
    if (type && type !== 'ALL') {
      conditions.push(`UPPER(r.type) = UPPER($${paramIndex})`);
      params.push(type);
      paramIndex++;
    }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // ** CONSULTA PRINCIPAL DE DATOS 
    const dataQuery = `
      SELECT r.id, r.type, r.description, r.status, r.amount, r.created_at, u.name as user_name, u.email as user_email
      FROM requests r
      LEFT JOIN users u ON r.created_by = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // ** CONSULTA PARA LA PAGINACION
    const countQuery = `
      SELECT COUNT(*) 
      FROM requests r
      LEFT JOIN users u ON r.created_by = u.id
      ${whereClause}
    `;

    const dataParams = [...params, limit, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataParams),
      pool.query(countQuery, params)
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

      const oldReqRes = await client.query('SELECT status FROM requests WHERE id = $1', [id]);
      const previousStatus = oldReqRes.rows[0]?.status;

      const updateQuery = `
        UPDATE requests
        SET status = $1
        WHERE id = $2
        RETURNING *
      `;
      const { rows } = await client.query(updateQuery, [status, id]);
      const updatedRequest = rows[0];

      const historyQuery = `
        INSERT INTO request_status_history 
        (request_id, previous_status, new_status, changed_by, changed_at, reason)
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `;
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
      SELECT r.id, r.status, r.created_by, r.amount, r.type, u.email as user_email, u.name as user_name
      FROM requests r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = $1
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