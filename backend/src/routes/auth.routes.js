const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin } = require('../validators/auth.validator');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints de autenticación
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso, retorna JWT
 *       400:
 *         description: Credenciales inválidas o datos incorrectos
 */

router.post('/login', validateLogin, authController.login);
router.post('/register', authController.register);

module.exports = router;
