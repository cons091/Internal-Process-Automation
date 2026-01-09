const RequestService = require('../services/request.service');
const RequestModel = require('../models/request.model');
const EmailService = require('../services/email.service'); 
const pool = require('../config/db') || require('../db');
const { REQUEST_TYPES, STATUS } = require('../config/constants');

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
      let { page, limit, search, status, type } = req.query;
      
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;

      const { id, role } = req.user;
      const userIdFilter = role === 'ADMIN' ? null : id;
      const result = await RequestService.getAllRequests(page, limit, userIdFilter, search, status, type);

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
      const changedBy = req.user.id;

      console.log(`\n--- 🛠 INICIANDO CAMBIO MANUAL ---`);
      console.log(`📝 ID Solicitud: ${id} | Nuevo Estado: ${status}`);

      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      const requestData = await RequestModel.findById(id);
      
      if (!requestData) {
        console.log("❌ Error: Solicitud no encontrada en DB");
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      console.log(`👤 Usuario dueño de la solicitud: ${requestData.user_name}`);
      console.log(`📧 EMAIL ENCONTRADO: [ ${requestData.user_email} ]`);

      const updated = await RequestModel.updateStatus(id, status, changedBy, "Cambio manual por Admin");
      
      if (status !== 'PENDING') {
         if (requestData.user_email) {
            console.log(`📨 Enviando correo a ${requestData.user_email}...`);
            
            await EmailService.sendStatusNotification(
                requestData.user_email,
                requestData.user_name,
                requestData.type,
                status,
                "Revisión manual administrativa."
            );
            console.log(`✅ ¡Correo enviado exitosamente!`);
         } else {
            console.log(`⚠️ ALERTA: El usuario NO tiene email registrado. No se envió nada.`);
         }
      }

      console.log(`--- FIN DEL PROCESO ---\n`);
      res.json(updated);

    } catch (error) {
      console.error("❌ ERROR CRITICO:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getHistory: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const userId = req.user.id; 
      const userRole = req.user.role;

      const request = await RequestModel.findById(id);
      
      if (!request) {
        return res.status(404).json({ error: "Solicitud no encontrada" });
      }

      if (userRole !== 'ADMIN' && request.created_by !== userId) {
        return res.status(403).json({ error: "No tienes permiso para ver este historial" });
      }

      const history = await RequestModel.getHistory(id);
      res.json(history);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el historial' });
    }
  },

  autoProcess: async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    console.log(`\n--- 🤖 INICIANDO AUTO-PROCESO ID: ${id} ---`);

    try {
      await client.query('BEGIN');
      const query = `
        SELECT r.*, u.email as user_email, u.name as user_name 
        FROM requests r
        LEFT JOIN users u ON r.created_by = u.id
        WHERE r.id = $1 
        FOR UPDATE OF r
      `;
      
      const requestResult = await client.query(query, [id]);

      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
      
      const request = requestResult.rows[0];
      
      console.log(`🔎 Datos recuperados: Monto=${request.amount}, Email=${request.user_email}`);

      if (request.status !== 'PENDING') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'La solicitud ya fue procesada anteriormente.' });
      }

      const configResult = await client.query('SELECT key, value FROM system_config');
      const config = configResult.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {});

      let newStatus = 'PENDING';
      let reason = 'No cumplió criterios automáticos para aprobación/rechazo directo.';
      const amount = parseFloat(request.amount);
      const type = request.type.toUpperCase();

      const timeBasedTypes = [
        REQUEST_TYPES.VACATION, 
        REQUEST_TYPES.SICK_LEAVE, 
        REQUEST_TYPES.LICENSE
      ];

      const moneyBasedTypes = [
        REQUEST_TYPES.EXPENSES, 
        REQUEST_TYPES.REFUND, 
        REQUEST_TYPES.DIEM
      ];

      // ** LÓGICA DE REGLAS **
      if (timeBasedTypes.includes(type)) {
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
      else if (moneyBasedTypes.includes(type)) {
          const maxMoney = parseFloat(config['AUTO_APPROVE_MONEY_LIMIT'] || 0);
          const rejectMoney = parseFloat(config['AUTO_REJECT_MONEY_LIMIT'] || 999999999);
          
          if (amount <= maxMoney) {
              newStatus = 'APPROVED';
              reason = `Auto-Aprobado: Monto $${amount} es menor o igual al límite de $${maxMoney}.`;
          } else if (amount > rejectMoney) {
              newStatus = 'REJECTED';
              reason = `Auto-Rechazado: Monto $${amount} excede el límite máximo permitido de $${rejectMoney}.`;
          }
      }

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

      // ** ENVÍO DE NOTIFICACIÓN POR EMAIL **
      if (newStatus !== 'PENDING') {
        if (request.user_email) {
            console.log(`📨 (Auto) Enviando correo a ${request.user_email}...`);
            EmailService.sendStatusNotification(
                request.user_email,
                request.user_name,
                request.type,
                newStatus,
                reason
            ).catch(err => console.error("❌ Error enviando email en background:", err));
        } else {
            console.warn(`⚠️ (Auto) Usuario sin email. No se envió notificación.`);
        }
      }

      console.log(`--- FIN AUTO-PROCESO: ${newStatus} ---\n`);
      
      res.json({ success: true, status: newStatus, message: reason, sentTo: request.user_email});

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
      const { value } = req.body;
      
      await pool.query('UPDATE system_config SET value = $1 WHERE key = $2', [value, key]);
      res.json({ success: true, message: 'Regla actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = RequestController;