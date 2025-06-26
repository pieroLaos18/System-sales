const pool = require('../config/db');

const getSalesByDate = async (from, to) => {
  let query = `
    SELECT v.id, v.fecha, p.name as product, dv.cantidad,
           (dv.cantidad * dv.precio_unitario) as total,
           u.nombre as usuario
    FROM ventas v
    JOIN detalle_ventas dv ON v.id = dv.venta_id
    JOIN products p ON dv.producto_id = p.id
    JOIN users u ON v.user_id = u.id
  `;
  const params = [];

  if (from && to) {
    query += ' WHERE v.fecha BETWEEN ? AND ?';
    params.push(from, to);
  } else if (from) {
    query += ' WHERE v.fecha >= ?';
    params.push(from);
  } else if (to) {
    query += ' WHERE v.fecha <= ?';
    params.push(to);
  }

  query += ' ORDER BY v.fecha ASC';

  const [result] = await pool.query(query, params);
  return result;
};

const logReportActivity = async (descripcion, usuario) => {
  await pool.query(
    'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
    [descripcion, usuario]
  );
};

module.exports = {
  getSalesByDate,
  logReportActivity
};
