const { check } = require('express-validator');
const { validateResult } = require('./validateHelper');

const validateLogin = [
    check('email')
        .exists()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un formato de email válido')
        .normalizeEmail(),
    
    check('password')
        .exists()
        .notEmpty().withMessage('La contraseña es requerida'),
    
    (req, res, next) => {
        validateResult(req, res, next);
    }
];

module.exports = { validateLogin };