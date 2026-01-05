const pool = require('../config/db');

const RequestHistoryModel = {
  create: async (requestId, previous_status, newStatus, changedBy) => {
    await pool.query(
      `
      INSERT INTO request_status_history 
      (request_id, previous_status, new_status, changed_by)
      VALUES ($1, $2, $3, $4)
      `,
      [requestId, previous_status, newStatus, changedBy]
    );
  },

  findByRequestId: async (requestId) => {
    const result = await pool.query(
      `
      SELECT 
        previous_status,
        new_status,
        changed_by,
        changed_at
      FROM request_status_history
      WHERE request_id = $1
      ORDER BY changed_at DESC
      `,
      [requestId]
    );

    return result.rows;
  },
};

module.exports = RequestHistoryModel;
