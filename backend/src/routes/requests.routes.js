const express = require('express');
const router = express.Router();

const RequestController = require('../controllers/requests.controller.js'); 
const verifyToken = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');

// Todo lo que esté debajo de esta línea requiere un Token JWT válido.
router.use(verifyToken);

// ** RUTAS GENERALES ** (Cualquier usuario logueado)
// Crear nueva solicitud
router.post('/', RequestController.createRequest || RequestController.create); 

// Listar solicitudes
router.get('/', RequestController.getRequests || RequestController.getAll);

// Ver historial de una solicitud
router.get('/:id/history', RequestController.getRequestHistory || RequestController.getHistory);

// ** RUTAS ADMIN **

// Aprobar o Rechazar solicitud
router.put('/:id/status', checkRole('ADMIN'), RequestController.updateStatus);


// ** RUTAS DE AUTOMATIZACIÓN **
router.post('/:id/auto-process', RequestController.processRequestAutomatic || RequestController.autoProcess);

module.exports = router;

// ** RUTAS DE CONFIGURACIÓN DEL SISTEMA **
// GET: Para mostrar las reglas en el modal
router.get('/system/config', checkRole('ADMIN'), RequestController.getSystemConfig);

// PUT: Para guardar cambios en una regla específica
router.put('/system/config/:key', checkRole('ADMIN'), RequestController.updateSystemConfig);
