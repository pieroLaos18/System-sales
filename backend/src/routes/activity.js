const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Función para crear la tabla activities si no existe
const createActivitiesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        descripcion TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usuario VARCHAR(100),
        tipo VARCHAR(50),
        detalles TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla activities verificada/creada');
    
    // Verificar si las columnas necesarias existen, si no, agregarlas
    try {
      // Verificar columna 'tipo'
      const [tipoColumns] = await pool.query(`SHOW COLUMNS FROM activities LIKE 'tipo'`);
      if (tipoColumns.length === 0) {
        await pool.query(`ALTER TABLE activities ADD COLUMN tipo VARCHAR(50) AFTER usuario`);
        console.log('✅ Columna tipo agregada');
      } else {
        console.log('✅ Columna tipo ya existe');
      }

      // Verificar columna 'detalles'
      const [detallesColumns] = await pool.query(`SHOW COLUMNS FROM activities LIKE 'detalles'`);
      if (detallesColumns.length === 0) {
        await pool.query(`ALTER TABLE activities ADD COLUMN detalles TEXT AFTER tipo`);
        console.log('✅ Columna detalles agregada');
      } else {
        console.log('✅ Columna detalles ya existe');
      }

      // Verificar columna 'created_at'
      const [createdAtColumns] = await pool.query(`SHOW COLUMNS FROM activities LIKE 'created_at'`);
      if (createdAtColumns.length === 0) {
        await pool.query(`ALTER TABLE activities ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        console.log('✅ Columna created_at agregada');
      } else {
        console.log('✅ Columna created_at ya existe');
      }

    } catch (alterError) {
      console.log('ℹ️  Error verificando/agregando columnas:', alterError.message);
    }
    
    // Verificar si la tabla ya tiene datos de ejemplo o está vacía
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM activities');
    
    if (countResult[0].count === 0) {
      console.log('ℹ️  Tabla activities vacía - lista para usar');
    } else {
      // Si ya hay registros, actualizar los que tienen tipo NULL
      try {
        const [nullTypeCount] = await pool.query('SELECT COUNT(*) as count FROM activities WHERE tipo IS NULL');
        if (nullTypeCount[0].count > 0) {
          console.log(`🔄 Actualizando ${nullTypeCount[0].count} registros con tipo NULL...`);
          
          // Actualizar tipos basados en palabras clave en la descripción
          await pool.query(`
            UPDATE activities SET tipo = CASE
              WHEN descripcion LIKE '%inicio%sesion%' OR descripcion LIKE '%login%' OR descripcion LIKE '%ingreso%' THEN 'login'
              WHEN descripcion LIKE '%cierre%sesion%' OR descripcion LIKE '%logout%' OR descripcion LIKE '%cerro%sesion%' THEN 'logout'
              WHEN descripcion LIKE '%producto%' OR descripcion LIKE '%agregado%' OR descripcion LIKE '%actualizado%' THEN 'producto'
              WHEN descripcion LIKE '%venta%' OR descripcion LIKE '%cliente%' THEN 'venta'
              WHEN descripcion LIKE '%usuario%' OR descripcion LIKE '%registro%' OR descripcion LIKE '%nuevo usuario%' THEN 'usuario'
              WHEN descripcion LIKE '%verificacion%' OR descripcion LIKE '%cuenta%' THEN 'sistema'
              WHEN descripcion LIKE '%reporte%' OR descripcion LIKE '%informe%' THEN 'reporte'
              WHEN descripcion LIKE '%inventario%' OR descripcion LIKE '%stock%' THEN 'inventario'
              WHEN descripcion LIKE '%backup%' OR descripcion LIKE '%respaldo%' THEN 'sistema'
              ELSE 'sistema'
            END
            WHERE tipo IS NULL
          `);
          
          console.log('✅ Tipos actualizados para registros existentes');
        }
      } catch (updateError) {
        console.log('ℹ️  Error actualizando tipos:', updateError.message);
      }
    }
  } catch (error) {
    console.error('Error al crear tabla activities:', error);
  }
};

// Endpoint para agregar columnas faltantes (solo para desarrollo)
router.post('/add-columns', async (req, res) => {
  try {
    const results = [];

    // Verificar y agregar columna 'tipo'
    try {
      const [tipoColumns] = await pool.query(`SHOW COLUMNS FROM activities LIKE 'tipo'`);
      if (tipoColumns.length === 0) {
        await pool.query(`ALTER TABLE activities ADD COLUMN tipo VARCHAR(50) AFTER usuario`);
        results.push('✅ Columna tipo agregada');
      } else {
        results.push('ℹ️  Columna tipo ya existe');
      }
    } catch (err) {
      results.push(`❌ Error con columna tipo: ${err.message}`);
    }

    // Verificar y agregar columna 'detalles'
    try {
      const [detallesColumns] = await pool.query(`SHOW COLUMNS FROM activities LIKE 'detalles'`);
      if (detallesColumns.length === 0) {
        await pool.query(`ALTER TABLE activities ADD COLUMN detalles TEXT AFTER tipo`);
        results.push('✅ Columna detalles agregada');
      } else {
        results.push('ℹ️  Columna detalles ya existe');
      }
    } catch (err) {
      results.push(`❌ Error con columna detalles: ${err.message}`);
    }

    // Verificar y agregar columna 'created_at'
    try {
      const [createdAtColumns] = await pool.query(`SHOW COLUMNS FROM activities LIKE 'created_at'`);
      if (createdAtColumns.length === 0) {
        await pool.query(`ALTER TABLE activities ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        results.push('✅ Columna created_at agregada');
      } else {
        results.push('ℹ️  Columna created_at ya existe');
      }
    } catch (err) {
      results.push(`❌ Error con columna created_at: ${err.message}`);
    }

    res.json({ 
      message: 'Proceso de agregar columnas completado',
      results: results
    });
  } catch (error) {
    console.error('Error agregando columnas:', error);
    res.status(500).json({ message: 'Error agregando columnas' });
  }
});

// Endpoint para verificar estructura de la tabla (solo para desarrollo)
router.get('/check-structure', async (req, res) => {
  try {
    const [columns] = await pool.query('DESCRIBE activities');
    res.json({
      message: 'Estructura de la tabla activities',
      columns: columns.map(col => ({
        Field: col.Field,
        Type: col.Type,
        Null: col.Null,
        Key: col.Key,
        Default: col.Default
      }))
    });
  } catch (error) {
    console.error('Error al verificar estructura de tabla:', error);
    res.status(500).json({ message: 'Error al verificar estructura de tabla' });
  }
});

// Endpoint para forzar migración de la tabla (solo para desarrollo)
router.post('/migrate', async (req, res) => {
  try {
    await createActivitiesTable();
    res.json({ message: 'Migración de tabla activities completada' });
  } catch (error) {
    console.error('Error en migración:', error);
    res.status(500).json({ message: 'Error en migración' });
  }
});

// Función reutilizable para obtener actividades
const obtenerActividades = async (query, res, mensajeError) => {
  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(`${mensajeError}:`, err);
    
    // Si el error es por columna 'tipo' no encontrada, intentar consulta sin 'tipo'
    if (err.code === 'ER_BAD_FIELD_ERROR' && err.message.includes("'tipo'")) {
      try {
        console.log('⚠️  Columna tipo no existe, usando consulta alternativa...');
        const fallbackQuery = query.replace(/,\s*tipo/g, '').replace(/tipo,\s*/g, '');
        const [fallbackRows] = await pool.query(fallbackQuery);
        
        // Agregar campo tipo con valor por defecto
        const rowsWithTipo = fallbackRows.map(row => ({
          ...row,
          tipo: 'sistema' // valor por defecto
        }));
        
        res.json(rowsWithTipo);
        console.log('✅ Consulta alternativa exitosa');
      } catch (fallbackErr) {
        console.error('Error en consulta alternativa:', fallbackErr);
        res.status(500).json({ message: mensajeError });
      }
    } else {
      res.status(500).json({ message: mensajeError });
    }
  }
};

// Obtener las últimas actividades con límite (por defecto 10, pero acepta query param)
router.get('/ultimas', async (req, res) => {
  await createActivitiesTable(); // Asegurar que la tabla existe
  const limit = parseInt(req.query.limit) || 10;
  const query = `SELECT id, descripcion, fecha, usuario, tipo, detalles FROM activities ORDER BY fecha DESC LIMIT ${limit}`;
  obtenerActividades(query, res, 'Error al obtener las últimas actividades');
});

// Obtener actividades recientes (alias para ultimas con límite de 5)
router.get('/recientes', async (req, res) => {
  await createActivitiesTable(); // Asegurar que la tabla existe
  const limit = parseInt(req.query.limit) || 5;
  const query = `SELECT id, descripcion, fecha, usuario, tipo, detalles FROM activities ORDER BY fecha DESC LIMIT ${limit}`;
  obtenerActividades(query, res, 'Error al obtener las actividades recientes');
});

// Obtener todas las actividades
router.get('/', async (req, res) => {
  await createActivitiesTable(); // Asegurar que la tabla existe
  const query = 'SELECT * FROM activities ORDER BY fecha DESC';
  obtenerActividades(query, res, 'Error al obtener todas las actividades');
});

// Crear nueva actividad
router.post('/', async (req, res) => {
  try {
    await createActivitiesTable(); // Asegurar que la tabla existe
    const { descripcion, usuario, tipo, detalles } = req.body;
    const query = 'INSERT INTO activities (descripcion, usuario, tipo, detalles) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [descripcion, usuario, tipo, detalles]);
    res.json({ id: result.insertId, message: 'Actividad creada exitosamente' });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ message: 'Error al crear actividad' });
  }
});

// Endpoint para actualizar tipos de actividades existentes (solo para desarrollo)
router.post('/update-types', async (req, res) => {
  try {
    const [nullTypeCount] = await pool.query('SELECT COUNT(*) as count FROM activities WHERE tipo IS NULL');
    
    if (nullTypeCount[0].count === 0) {
      return res.json({ 
        message: 'No hay registros con tipo NULL para actualizar',
        updated: 0
      });
    }
    
    await pool.query(`
      UPDATE activities SET tipo = CASE
        WHEN descripcion LIKE '%inicio%sesion%' OR descripcion LIKE '%login%' OR descripcion LIKE '%ingreso%' THEN 'login'
        WHEN descripcion LIKE '%cierre%sesion%' OR descripcion LIKE '%logout%' OR descripcion LIKE '%cerro%sesion%' THEN 'logout'
        WHEN descripcion LIKE '%producto%' OR descripcion LIKE '%agregado%' OR descripcion LIKE '%actualizado%' THEN 'producto'
        WHEN descripcion LIKE '%venta%' OR descripcion LIKE '%cliente%' THEN 'venta'
        WHEN descripcion LIKE '%usuario%' OR descripcion LIKE '%registro%' OR descripcion LIKE '%nuevo usuario%' THEN 'usuario'
        WHEN descripcion LIKE '%verificacion%' OR descripcion LIKE '%cuenta%' THEN 'sistema'
        WHEN descripcion LIKE '%reporte%' OR descripcion LIKE '%informe%' THEN 'reporte'
        WHEN descripcion LIKE '%inventario%' OR descripcion LIKE '%stock%' THEN 'inventario'
        WHEN descripcion LIKE '%backup%' OR descripcion LIKE '%respaldo%' THEN 'sistema'
        ELSE 'sistema'
      END
      WHERE tipo IS NULL
    `);
    
    res.json({ 
      message: 'Tipos de actividades actualizados exitosamente',
      updated: nullTypeCount[0].count
    });
  } catch (error) {
    console.error('Error actualizando tipos:', error);
    res.status(500).json({ message: 'Error actualizando tipos de actividades' });
  }
});

module.exports = router;
