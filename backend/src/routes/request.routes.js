const express = require('express');
const router = express.Router();

const RequestController = require('../controllers/request.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');
const checkRole = require('../middlewares/role.middleware.js');
const { strictLimiter } = require('../middlewares/limiter.js');
const { validateCreateRequest } = require('../validators/request.validator');

/**
 * @swagger
 * tags:
 *   - name: Requests
 *     description: Gestión de solicitudes
 */

/**
 * @swagger
 * /api/request:
 *   post:
 *     summary: Crear una nueva solicitud
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */

router.use(verifyToken);

router.post('/', validateCreateRequest, RequestController.createRequest || RequestController.create);

router.get('/', RequestController.getRequests || RequestController.getAll);

router.get('/:id/history', RequestController.getRequestHistory || RequestController.getHistory);

router.put('/:id/status', checkRole('ADMIN'), RequestController.updateStatus);

router.post('/:id/auto-process', strictLimiter, RequestController.processRequestAutomatic || RequestController.autoProcess);

router.get('/system/config', checkRole('ADMIN'), RequestController.getSystemConfig);

router.put('/system/config/:key', checkRole('ADMIN'), RequestController.updateSystemConfig);

module.exports = router;
