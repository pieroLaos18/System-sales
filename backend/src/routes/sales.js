// routes/salesRoutes.js

const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authenticate = require('../middleware/authenticate');
const migrationService = require('../services/migrationService');

// Endpoint de migración (solo para desarrollo)
router.post('/migrate-fecha-datetime', async (req, res) => {
  try {
    const result = await migrationService.migrateFechaToDatetime();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error en migración', 
      error: error.message 
    });
  }
});

// Rutas públicas
router.get('/', salesController.getAllSales);
router.get('/resumen', salesController.getSalesResumen);
router.get('/ventas-por-dia', salesController.getVentasPorDia);
router.get('/ventas-por-dia-anterior', salesController.getVentasPorDiaAnterior);
router.get('/test-ventas-por-dia', salesController.testVentasPorDia);
router.get('/debug-ventas', salesController.debugVentas);
router.get('/metodos-pago', salesController.getMetodosPago);
router.get('/top-products', salesController.getTopProducts);
router.get('/:id', salesController.getVentaById);
router.get('/comprobante/:id', salesController.generarComprobante);

// Rutas protegidas
router.post('/', authenticate, salesController.createVenta);
router.put('/anular/:id', authenticate, salesController.anularVenta);

module.exports = router;