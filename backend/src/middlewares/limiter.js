const rateLimit = require('express-rate-limit');

// Limitador General (Para toda la API)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Demasiadas peticiones desde esta IP, por favor intente nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador Estricto (Para Auto-Process y Login)
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: 'Demasiados intentos de procesamiento. Por favor espere 1 minuto.'
  }
});

module.exports = { globalLimiter, strictLimiter };