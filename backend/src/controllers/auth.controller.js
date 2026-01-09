const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'USER'
    });

    return res.status(201).json({
      message: "Usuario creado exitosamente",
      user: newUser
    });

  } catch (error) {
    console.error("Error en Register:", error);
    return res.status(500).json({ message: "Error en el servidor al registrar" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role || 'USER',
        name: user.name
      },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '8h' }
    );

    return res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'USER'
      }
    });

  } catch (error) {
    console.error("Error en Login:", error);
    return res.status(500).json({ message: "Error en el servidor al login" });
  }
};

module.exports = { register, login };