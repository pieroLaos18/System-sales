const mysql = require('mysql2/promise');
require('dotenv').config();

// Validación de variables de entorno requeridas
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno: ${key}`);
  }
}

// Crear el pool de conexiones con opciones adicionales
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,     // Límite de conexiones en el pool
  queueLimit: 0            // Sin límite de espera
});

// Verificación opcional de conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // Verifica que la conexión funcione
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1); // Finaliza la app si la conexión falla
  }
})();

module.exports = pool;
