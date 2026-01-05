const RequestModel = require('../models/request.model');
const RequestHistoryModel = require('../models/requestHistory.model');

const RequestService = {
  createRequest: async (data) => {
    if (!data.type || !data.description) {
      throw new Error('Type and description are required');
    }

    return await RequestModel.create(data);
  },

  getAllRequests: async () => {
    return await RequestModel.findAll();
  },

  updateRequestStatus: async (id, newStatus, changedBy = 'system') => {
    const allowedStatuses = ['APPROVED', 'REJECTED'];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    const request = await RequestModel.findById(id);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Only pending requests can be updated');
    }

    // 1️⃣ Guardar auditoría
    await RequestHistoryModel.create(
      id,
      request.status,
      newStatus,
      changedBy
    );

    // 2️⃣ Actualizar estado
    return await RequestModel.updateStatus(id, newStatus);
  },
  getRequestHistory: async (requestId) => {
    const history = await RequestHistoryModel.findByRequestId(requestId);

    if (!history.length) {
      throw new Error('No history found for this request');
    }

    return history;
  },

  autoProcessRequest: async (id) => {
  const request = await RequestModel.findById(id);

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'PENDING') {
      throw new Error('Request already processed');
    }

    let newStatus = 'PENDING';
    let reason = 'Requires manual approval';

    if (request.type === 'TI') {
      newStatus = 'APPROVED';
      reason = 'Auto-approved by automation rule';
    }

    if (newStatus !== 'PENDING') {
      await RequestHistoryModel.create(
        id,
        request.status,
        newStatus,
        'automation'
      );

      await RequestModel.updateStatus(id, newStatus);
    }

    return {
      id: request.id,
      previousStatus: request.status,
      newStatus,
      reason,
    };
  },

};

module.exports = RequestService;
