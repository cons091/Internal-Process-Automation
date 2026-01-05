const requireAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];

  if (!role) {
    return res.status(401).json({ error: 'User role is required' });
  }

  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};

module.exports = { requireAdmin };
