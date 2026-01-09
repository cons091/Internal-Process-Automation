const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Acceso denegado: Falta el token de autenticación' });
  }
  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado: Formato de token inválido' });
  }

  try {
    // Verificar el token
    const secret = process.env.JWT_SECRET || 'secreto_super_seguro_dev';
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded; 
    
    next(); 
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;