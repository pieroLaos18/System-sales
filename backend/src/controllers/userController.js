// controllers/userController.js

const userService = require('../services/userService');
const pool = require('../config/db');
const { cerrarSesion } = require('../services/sessionService');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllActiveUsers();
    res.json(users);
  } catch (err) {
    console.error('❌ Error en getAllUsers:', err.message); // 👈 AÑADE ESTO
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getActiveUserCount = async (req, res) => {
  try {
    const count = await userService.countActiveUsers();
    res.json({ activos: count });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios activos' });
  }
};

const updateUserRole = async (req, res) => {
  const { role, usuario } = req.body;
  const { id } = req.params;
  try {
    await userService.updateUserRole(id, role); // 👈 aquí el cambio
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const usuario = req.body?.usuario || 'Desconocido';
  try {
    await userService.deactivateUser(id, req.user, usuario);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

const updateActivity = async (req, res) => {
  try {
    await userService.updateActivity(req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error al actualizar actividad del usuario:', err.message);
    res.status(500).json({ error: 'Error al actualizar actividad' });
  }
};

const logout = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_online = 0 WHERE id = ?', [req.user.id]);

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await cerrarSesion(token);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error en logout:', err.message);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

const logoutInactiveUsers = async (req, res) => {
  try {
    await userService.logoutInactiveUsers();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al cerrar sesión de usuarios inactivos' });
  }
};

const isUserActive = async (req, res) => {
  const { id } = req.params;
  try {
    const active = await userService.isUserActive(id);
    if (active === null) return res.status(404).json({ active: false });
    res.json({ active });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar si el usuario está activo' });
  }
};

const bcrypt = require('bcryptjs');

const verifyPassword = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);

    return res.json({ verified: isMatch });
  } catch (error) {
    console.error('❌ Error al verificar contraseña:', error.message);
    return res.status(500).json({ message: 'Error al verificar la contraseña' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    let imageUrl = null;
    if (req.file) {
      // Si viene de Azure Blob Storage, req.file.url tendrá la URL completa
      imageUrl = req.file.url || `/uploads/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE users SET nombre = ?, correo_electronico = ?, imagen = ? WHERE id = ?',
      [name, email, imageUrl || null, id]
    );
    
    res.json({
      success: true,
      name,
      email,
      image: imageUrl
    });

  } catch (err) {
    console.error('❌ Error al actualizar perfil:', err.message);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};


module.exports = {
  getAllUsers,
  getActiveUserCount,
  updateUserRole,
  deleteUser,
  updateActivity,
  logout,
  logoutInactiveUsers,
  isUserActive,
  verifyPassword,
  updateUserProfile,
};
