const { check } = require('express-validator');
const { validateResult } = require('./validateHelper');

const validateCreateRequest = [
    check('amount')
        .exists()
        .notEmpty().withMessage('El monto es requerido')
        .isFloat({ min: 0.01 }).withMessage('El monto debe ser un número positivo mayor a 0')
        .toFloat(),
    
    check('description')
        .exists()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 5, max: 255 }).withMessage('La descripción debe tener entre 5 y 255 caracteres')
        .trim()
        .escape(),
        
    check('type')
        .optional()
        .isIn(['PURCHASE', 'REFUND', 'TRAVEL']).withMessage('Tipo de solicitud inválido'),

    (req, res, next) => {
        validateResult(req, res, next);
    }
];

module.exports = { validateCreateRequest };