// Script de migración para actualizar la estructura de la tabla ventas
const pool = require('../config/db');

async function migrateFechaToDatetime() {
  try {
    console.log('🔧 Iniciando migración de fecha a DATETIME...');
    
    // Verificar la estructura actual
    const [currentStructure] = await pool.query('DESCRIBE ventas');
    const fechaColumn = currentStructure.find(col => col.Field === 'fecha');
    
    console.log('📋 Estructura actual de la columna fecha:', fechaColumn);
    
    // Si ya es DATETIME, no hacer nada
    if (fechaColumn && fechaColumn.Type.includes('datetime')) {
      console.log('✅ La columna fecha ya es DATETIME, no se requiere migración');
      return { success: true, message: 'Columna ya migrada' };
    }
    
    // Cambiar de DATE a DATETIME
    await pool.query('ALTER TABLE ventas MODIFY COLUMN fecha DATETIME NOT NULL');
    
    // Verificar el cambio
    const [newStructure] = await pool.query('DESCRIBE ventas');
    const newFechaColumn = newStructure.find(col => col.Field === 'fecha');
    
    console.log('✅ Nueva estructura de la columna fecha:', newFechaColumn);
    console.log('🎉 Migración completada exitosamente');
    
    return { 
      success: true, 
      message: 'Migración completada: columna fecha cambiada a DATETIME',
      before: fechaColumn,
      after: newFechaColumn
    };
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  }
}

module.exports = {
  migrateFechaToDatetime
};
