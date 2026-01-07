const RequestService = require('../services/requests.service');
const RequestModel = require('../models/request.model'); // <--- ¡ESTA LÍNEA FALTABA!

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
    try {
      const { id } = req.params;

      const result = await RequestService.autoProcessRequest(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = RequestController;