const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({ message: 'Error de servidor: Auth middleware no ejecutado antes de Role middleware' });
    }

    // Comparamos el rol del token con el requerido
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Acceso denegado: Se requiere rol ${requiredRole}` 
      });
    }

    next();
  };
};

module.exports = checkRole;