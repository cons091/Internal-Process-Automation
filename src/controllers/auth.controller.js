const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Usuario registrado', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json({ message: 'Login exitoso', ...data });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { register, login };