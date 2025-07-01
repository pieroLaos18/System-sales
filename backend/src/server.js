const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    // 1. Marcar todos los usuarios como offline
    await pool.query('UPDATE users SET is_online = 0');
    console.log('🧹 Usuarios marcados como offline');

    // 2. Eliminar sesiones o tokens expirados (si usas una tabla de sesiones)
    await pool.query('DELETE FROM sessions WHERE expiracion < NOW()');
    console.log('🧼 Sesiones expiradas eliminadas');

    // Si tienes una tabla de tokens personalizados, cambia "sessions" por tu tabla
    // y "expiracion" por tu campo de expiración

  } catch (err) {
    console.error('[Startup] ❌ Error durante limpieza inicial:', err.message);
  }

  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
})();
