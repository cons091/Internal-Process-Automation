const RequestService = require('../services/requests.service');
const RequestModel = require('../models/request.model'); // <--- ¡ESTA LÍNEA FALTABA!
const pool = require('../config/db') || require('../db');

const RequestController = {
  create: async (req, res) => {
    try {
      const { type, description, amount } = req.body;
      const userId = req.user ? req.user.id : null;
      const requestData = {
        type,
        description,
        amount,
        created_by: userId,
        status: 'PENDING'
      };

      const request = await RequestService.createRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      let { page, limit } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;

      const { id, role } = req.user;

      const userIdFilter = role === 'ADMIN' ? null : id;

      const result = await RequestService.getAllRequests(page, limit, userIdFilter);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(result.total / limit)
        }
      });

    } catch (error) {
      console.error(error); 
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const changedBy = req.user.id; // ID del ADMIN (del Token)

      // Validamos que venga el status correcto
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      // Pasamos 'changedBy' al modelo
      // AHORA SÍ FUNCIONARÁ PORQUE RequestModel YA ESTÁ IMPORTADO
      const updated = await RequestModel.updateStatus(id, status, changedBy);

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  getHistory: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Validamos que sea un número válido para evitar errores de NaN
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const userId = req.user.id; 
      const userRole = req.user.role;

      // 1. Verificar que la solicitud existe
      const request = await RequestModel.findById(id); // Ahora pasamos un número
      
      if (!request) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      // 2. SEGURIDAD: Si no es ADMIN, verificar que sea el dueño
      if (userRole !== 'ADMIN' && request.created_by !== userId) {
        return res.status(403).json({ error: "No tienes permiso para ver este historial" });
      }

      // 3. Obtener historial
      const history = await RequestModel.getHistory(id); // Ahora pasamos un número
      res.json(history);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el historial' });
    }
  },

  autoProcess: async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const requestResult = await client.query('SELECT * FROM requests WHERE id = $1 FOR UPDATE', [id]);
      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
      
      const request = requestResult.rows[0];
      if (request.status !== 'PENDING') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'La solicitud ya fue procesada anteriormente.' });
      }

      // Cargar configuración
      const configResult = await client.query('SELECT key, value FROM system_config');
      const config = configResult.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      let newStatus = 'PENDING';
      let reason = 'No cumplió criterios automáticos para aprobación/rechazo directo.';
      const amount = parseFloat(request.amount);
      const type = request.type.toUpperCase(); // Normalizamos a mayúsculas por seguridad

      // --- REGLAS DE TIEMPO (Vacaciones, Licencias) ---
      if (['VACACIONES', 'LICENCIA MEDICA', 'LICENCIA'].includes(type)) {
          const maxDays = parseFloat(config['AUTO_APPROVE_DAYS_LIMIT'] || 0);
          const rejectDays = parseFloat(config['AUTO_REJECT_MAX_DAYS'] || 999);
          
          if (amount <= maxDays) {
              newStatus = 'APPROVED';
              reason = `Auto-Aprobado: ${amount} días es menor o igual al límite de ${maxDays}.`;
          } else if (amount > rejectDays) {
              newStatus = 'REJECTED';
              reason = `Auto-Rechazado: ${amount} días excede el límite de seguridad de ${rejectDays}.`;
          }
      } 
      // --- REGLAS DE DINERO (Gastos, Reembolsos) ---
      else if (['GASTOS', 'REEMBOLSO DE GASTOS', 'VIATICOS'].includes(type)) {
          const maxMoney = parseFloat(config['AUTO_APPROVE_MONEY_LIMIT'] || 0);
          // Leemos el nuevo límite de rechazo. Si no existe, usamos un número gigante por defecto.
          const rejectMoney = parseFloat(config['AUTO_REJECT_MONEY_LIMIT'] || 999999999);
          
          if (amount <= maxMoney) {
              newStatus = 'APPROVED';
              reason = `Auto-Aprobado: Monto $${amount} es menor o igual al límite de $${maxMoney}.`;
          } else if (amount > rejectMoney) {
              // ¡AQUÍ ESTÁ LA LÓGICA QUE FALTABA!
              newStatus = 'REJECTED';
              reason = `Auto-Rechazado: Monto $${amount} excede el límite máximo permitido de $${rejectMoney}.`;
          }
      }

      // Ejecutar cambios
      if (newStatus !== 'PENDING') {
        await client.query('UPDATE requests SET status = $1 WHERE id = $2', [newStatus, id]);

        await client.query(
          `INSERT INTO request_status_history 
           (request_id, previous_status, new_status, changed_by, changed_at, reason) 
           VALUES ($1, $2, $3, $4, NOW(), $5)`,
          [id, 'PENDING', newStatus, req.user.id, reason]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, status: newStatus, message: reason });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en autoProcess:", error);
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  },

  getSystemConfig: async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM system_config ORDER BY key ASC');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSystemConfig: async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body; // El Admin envía el nuevo valor
      
      await pool.query('UPDATE system_config SET value = $1 WHERE key = $2', [value, key]);
      res.json({ success: true, message: 'Regla actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = RequestController;