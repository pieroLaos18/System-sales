const jwt = require('jsonwebtoken');

const generarToken = (user) =>
  jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = { generarToken };
