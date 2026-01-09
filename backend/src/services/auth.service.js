const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  
  async register(userData) {
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // ENCRIPTACION DE CONTRASEÑA
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = await UserModel.create({
      ...userData,
      password: hashedPassword
    });

    return newUser;
  }

  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    // GENERAR TOKEN JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secreto_super_seguro_dev', 
      { expiresIn: '8h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}

module.exports = new AuthService();