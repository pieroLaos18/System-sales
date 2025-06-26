// scripts/limpiarTokensExpirados.js

require('dotenv').config({ path: './backend/.env' }); // ✅ Carga variables de entorno

const pool = require('../backend/src/config/db'); // ✅ Usa la ruta correcta

(async () => {
  try {
    const [result] = await pool.query(
      'DELETE FROM pending_users WHERE token_expires_at < NOW()'
    );
    console.log(`🧹 Tokens expirados eliminados: ${result.affectedRows}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al limpiar tokens expirados:', err);
    process.exit(1);
  }
})();

