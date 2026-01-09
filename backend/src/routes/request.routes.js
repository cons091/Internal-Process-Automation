const express = require('express');
const router = express.Router();

const RequestController = require('../controllers/request.controller.js'); 
const verifyToken = require('../middlewares/auth.middleware.js');
const checkRole = require('../middlewares/role.middleware.js');

router.use(verifyToken);

// ** RUTAS GENERALES ** (Cualquier usuario logueado)
// CREAR NUEVA SOLICITUD
router.post('/', RequestController.createRequest || RequestController.create); 

// LISTAR SOLICITUDES
router.get('/', RequestController.getRequests || RequestController.getAll);

// VVER HISTORIAL DE UNA SOLICITUD
router.get('/:id/history', RequestController.getRequestHistory || RequestController.getHistory);

// ** RUTAS ADMIN **
// APROBAR O RECHAZAR SOLICITUD
router.put('/:id/status', checkRole('ADMIN'), RequestController.updateStatus);


// ** RUTAS DE AUTOMATIZACIÓN **
router.post('/:id/auto-process', RequestController.processRequestAutomatic || RequestController.autoProcess);

module.exports = router;

// ** RUTAS DE CONFIGURACIÓN DEL SISTEMA **
// GET: PARA OBTENER LA CONFIGURACIÓN ACTUAL
router.get('/system/config', checkRole('ADMIN'), RequestController.getSystemConfig);

// PUT: PARA GUARDAR NUEVA CONFIGURACIÓN
router.put('/system/config/:key', checkRole('ADMIN'), RequestController.updateSystemConfig);
