const RequestService = require('../services/requests.service');

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
      // Leemos los parámetros de la URL
      let { page, limit } = req.query;

      // Convertimos a números y asignamos defaults si no vienen
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;

      // Llamamos al servicio
      const result = await RequestService.getAllRequests(page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });

    } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, changedBy } = req.body;

      const updated = await RequestService.updateRequestStatus(
        id,
        status,
        changedBy || 'admin'
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getHistory: async (req, res) => {
    try {
      const { id } = req.params;

      const history = await RequestService.getRequestHistory(id);
      res.json(history);
    } catch (error) {
      res.status(404).json({ error: error.message });
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