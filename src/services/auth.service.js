const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  
  async register(userData) {
    // 1. Verificar si el usuario ya existe
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 3. Guardar en BD
    const newUser = await UserModel.create({
      ...userData,
      password: hashedPassword
    });

    return newUser;
  }

  async login(email, password) {
    // 1. Buscar usuario
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // 2. Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secreto_super_seguro_dev', 
      { expiresIn: '8h' }
    );

    // Retornamos usuario (sin la password) y el token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}

module.exports = new AuthService();