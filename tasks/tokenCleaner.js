require('dotenv').config({ path: './backend/.env' });
const cron = require('node-cron');
const pool = require('../backend/src/config/db');

// Programa la tarea para que corra cada hora
cron.schedule('*/15 * * * *', async () => {
  try {
    const [result] = await pool.query(
      'DELETE FROM pending_users WHERE token_expires_at < NOW()'
    );
    console.log(`[${new Date().toLocaleString()}] ✅ Tokens expirados eliminados: ${result.affectedRows}`);
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] ❌ Error al limpiar tokens:`, err);
  }
});

console.log('🕒 Token cleaner programado para ejecutarse cada hora...');
