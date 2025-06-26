// services/userService.js
const pool = require('../config/db');


const getAllActiveUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, nombre AS name, correo_electronico AS email, rol AS role FROM users WHERE activo = 1'
  );
  return rows;
};

const getOnlineUserCount = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS activos FROM users WHERE is_online = 1'
  );
  return rows[0].activos;
};

const updateUserProfile = async (id, name, email, imagePath) => {
  await pool.query(
    'UPDATE users SET nombre = ?, correo_electronico = ?, imagen = ? WHERE id = ?',
    [name, email, imagePath, id]
  );
};

const updateUserRole = async (id, role) => {
  await pool.query('UPDATE users SET rol = ? WHERE id = ?', [role, id]);
};

const deactivateUser = async (id) => {
  await pool.query('UPDATE users SET activo = 0, is_online = 0 WHERE id = ?', [id]);
};

const updateActivity = async (userId) => {
  await pool.query('UPDATE users SET last_login = NOW(), is_online = 1 WHERE id = ?', [userId]);
};

const logoutUser = async (userId) => {
  await pool.query('UPDATE users SET is_online = 0 WHERE id = ?', [userId]);
};

const logoutInactiveUsers = async () => {
  await pool.query(
    'UPDATE users SET is_online = 0 WHERE last_login < NOW() - INTERVAL 10 MINUTE AND is_online = 1'
  );
};

const countActiveUsers = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE is_online = 1');
  return rows[0].count;
};


const isUserActive = async (id) => {
  const [user] = await pool.query('SELECT activo FROM users WHERE id = ?', [id]);
  return user.length ? user[0].activo === 1 : false;
};

module.exports = {
  getAllActiveUsers,
  getOnlineUserCount,
  updateUserRole,
  deactivateUser,
  updateActivity,
  logoutUser,
  logoutInactiveUsers,
  isUserActive,
  countActiveUsers,
  updateUserProfile,
};
