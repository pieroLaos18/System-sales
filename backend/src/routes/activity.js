const express = require('express');
const router = express.Router();
const pool = require('../config/db');


// Función reutilizable para obtener actividades
const obtenerActividades = async (query, res, mensajeError) => {
  try {
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(`${mensajeError}:`, err); // Logging de error para debug
    res.status(500).json({ message: mensajeError });
  }
};

// Obtener las últimas 10 actividades
router.get('/actividades/ultimas', (req, res) => {
  const query = 'SELECT id, descripcion, fecha FROM activities ORDER BY fecha DESC LIMIT 10';
  obtenerActividades(query, res, 'Error al obtener las últimas actividades');
});

// Obtener todas las actividades
router.get('/actividades', (req, res) => {
  const query = 'SELECT * FROM activities ORDER BY fecha DESC';
  obtenerActividades(query, res, 'Error al obtener todas las actividades');
});

module.exports = router;
