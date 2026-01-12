const { validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
    try {
        validationResult(req).throw();
        return next();
    } catch (err) {
        res.status(400).json({ 
            status: 'error',
            errors: err.array().map(error => ({
                field: error.path,
                msg: error.msg
            }))
        });
    }
};

module.exports = { validateResult };