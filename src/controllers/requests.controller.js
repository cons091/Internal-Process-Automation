const RequestService = require('../services/requests.service');

const RequestController = {
  create: async (req, res) => {
    try {
      const request = await RequestService.createRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const requests = await RequestService.getAllRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
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
  },

};

module.exports = RequestController;
