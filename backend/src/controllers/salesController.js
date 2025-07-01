// controllers/salesController.js

const salesService = require('../services/salesService');

exports.getAllSales = async (req, res) => {
  try {
    const ventas = await salesService.getAllSalesWithProducts();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

exports.getSalesResumen = async (req, res) => {
  try {
    const resumen = await salesService.getSalesResumen();
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen de ventas' });
  }
};

exports.getVentasPorDia = async (req, res) => {
  try {
    const data = await salesService.getVentasPorDia();
    res.json(data);
  } catch (error) {
    console.error('❌ Error en getVentasPorDia:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener ventas por día', 
      error: error.message,
      sqlState: error.sqlState || null,
      errno: error.errno || null
    });
  }
};

exports.getVentasPorDiaAnterior = async (req, res) => {
  try {
    const data = await salesService.getVentasPorDiaAnterior();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas semana anterior' });
  }
};

exports.testVentasPorDia = async (req, res) => {
  try {
    console.log('🔍 Iniciando test de ventas por día...');
    
    // Primero verificar si hay ventas en la DB
    const pool = require('../config/db');
    const [totalVentas] = await pool.query('SELECT COUNT(*) as total FROM ventas');
    const [ventasActivas] = await pool.query('SELECT COUNT(*) as total FROM ventas WHERE anulada = 0');
    const [ventasRecientes] = await pool.query('SELECT COUNT(*) as total FROM ventas WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    
    // Verificar estructura de la tabla
    const [tableStructure] = await pool.query('DESCRIBE ventas');
    
    // Obtener muestra de datos reales
    const [sampleData] = await pool.query('SELECT * FROM ventas WHERE anulada = 0 ORDER BY fecha DESC LIMIT 5');
    
    console.log('📊 Total ventas en DB:', totalVentas[0].total);
    console.log('📊 Ventas activas:', ventasActivas[0].total);
    console.log('📊 Ventas últimos 30 días:', ventasRecientes[0].total);
    console.log('🏗️ Estructura tabla ventas:', tableStructure);
    console.log('📋 Muestra de datos:', sampleData);
    
    const data = await salesService.getVentasPorDia();
    console.log('🔍 Resultado de getVentasPorDia:', data);
    
    res.json({
      success: true,
      dbStats: {
        totalVentas: totalVentas[0].total,
        ventasActivas: ventasActivas[0].total,
        ventasRecientes: ventasRecientes[0].total
      },
      tableStructure: tableStructure,
      sampleData: sampleData,
      dataCount: data.length,
      data: data,
      sample: data.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ Error en test ventas por día:', error);
    res.status(500).json({ message: 'Error al probar ventas por día', error: error.message });
  }
};

exports.debugVentas = async (req, res) => {
  try {
    const pool = require('../config/db');
    
    // Consulta directa para ver datos sin procesar
    const [rawData] = await pool.query(`
      SELECT 
        id,
        fecha,
        total,
        anulada,
        DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_formateada,
        DAYNAME(fecha) as dia_nombre
      FROM ventas 
      ORDER BY fecha DESC 
      LIMIT 10
    `);
    
    res.json({
      message: 'Datos crudos de ventas',
      count: rawData.length,
      data: rawData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo datos debug', error: error.message });
  }
};

exports.getMetodosPago = async (req, res) => {
  try {
    const data = await salesService.getMetodosPago();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métodos de pago' });
  }
};

exports.getVentaById = async (req, res) => {
  try {
    const venta = await salesService.getSaleById(req.params.id);
    res.json(venta);
  } catch (error) {
    console.error('❌ Error al obtener detalle de venta:', error);
    res.status(500).json({ message: 'Error al obtener detalle de venta' });
  }
};

exports.createVenta = async (req, res) => {
  try {
    const ventaId = await salesService.createVenta(req.body, req.user);
    res.status(200).json({ ventaId });
  } catch (error) {
    console.error('❌ Error en createVenta:', error); // 👈 Esto ayuda a ver el error real
    res.status(error.status || 500).json({ message: error.message || 'Error al registrar venta' });
  }
};

exports.anularVenta = async (req, res) => {
  try {
    const result = await salesService.anularVenta(req.params.id, req.body.motivo, req.body.user_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al anular venta' });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const productos = await salesService.getTopProducts(limit);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ message: 'Error al obtener productos más vendidos' });
  }
};

exports.generarComprobante = async (req, res) => {
  try {
    const comprobante = await salesService.generarComprobante(req.params.id);
    res.json(comprobante);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar comprobante', error });
  }
};