const salesController = require('../../controllers/salesController');
const salesService = require('../../services/salesService');
const pool = require('../../config/db');

// Mock de dependencias
jest.mock('../../services/salesService');
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

describe('Sales Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAllSales', () => {
    it('should return all sales successfully', async () => {
      const mockSales = [
        { id: 1, cliente: 'Cliente 1', total: 100 },
        { id: 2, cliente: 'Cliente 2', total: 200 }
      ];
      salesService.getAllSalesWithProducts.mockResolvedValue(mockSales);

      await salesController.getAllSales(req, res);

      expect(salesService.getAllSalesWithProducts).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockSales);
    });

    it('should handle errors', async () => {
      salesService.getAllSalesWithProducts.mockRejectedValue(new Error('DB Error'));

      await salesController.getAllSales(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener ventas' });
    });
  });

  describe('getSalesResumen', () => {
    it('should return sales summary successfully', async () => {
      const mockResumen = { hoy: 500, mes: 15000 };
      salesService.getSalesResumen.mockResolvedValue(mockResumen);

      await salesController.getSalesResumen(req, res);

      expect(salesService.getSalesResumen).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockResumen);
    });

    it('should handle errors', async () => {
      salesService.getSalesResumen.mockRejectedValue(new Error('DB Error'));

      await salesController.getSalesResumen(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener resumen de ventas' });
    });
  });

  describe('getVentasPorDia', () => {
    it('should return daily sales successfully', async () => {
      const mockData = [
        { dia: 'Lunes', fecha: '2025-07-01', total: 300 },
        { dia: 'Martes', fecha: '2025-07-02', total: 450 }
      ];
      salesService.getVentasPorDia.mockResolvedValue(mockData);

      await salesController.getVentasPorDia(req, res);

      expect(salesService.getVentasPorDia).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors with detailed error info', async () => {
      const mockError = new Error('SQL Error');
      mockError.sqlState = '42000';
      mockError.errno = 1064;
      mockError.stack = 'Error stack trace';
      salesService.getVentasPorDia.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await salesController.getVentasPorDia(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error en getVentasPorDia:', mockError);
      expect(consoleSpy).toHaveBeenCalledWith('❌ Stack trace:', mockError.stack);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al obtener ventas por día',
        error: 'SQL Error',
        sqlState: '42000',
        errno: 1064
      });

      consoleSpy.mockRestore();
    });
  });

  describe('getVentasPorDiaAnterior', () => {
    it('should return previous week sales successfully', async () => {
      const mockData = [
        { dia: 'Lunes', fecha: '2025-06-24', total: 200 }
      ];
      salesService.getVentasPorDiaAnterior.mockResolvedValue(mockData);

      await salesController.getVentasPorDiaAnterior(req, res);

      expect(salesService.getVentasPorDiaAnterior).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      salesService.getVentasPorDiaAnterior.mockRejectedValue(new Error('DB Error'));

      await salesController.getVentasPorDiaAnterior(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener ventas semana anterior' });
    });
  });

  describe('testVentasPorDia', () => {
    it('should return test data successfully', async () => {
      // Mock correcto para las consultas de pool.query
      pool.query
        .mockResolvedValueOnce([[{ total: 100 }]]) // totalVentas
        .mockResolvedValueOnce([[{ total: 95 }]])  // ventasActivas  
        .mockResolvedValueOnce([[{ total: 50 }]])  // ventasRecientes
        .mockResolvedValueOnce([[{ Field: 'id', Type: 'int' }]]) // tableStructure
        .mockResolvedValueOnce([[{ id: 1, fecha: '2025-07-01' }]]); // sampleData

      const mockServiceData = [{ dia: 'Lunes', total: 300 }];
      salesService.getVentasPorDia.mockResolvedValue(mockServiceData);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await salesController.testVentasPorDia(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        dbStats: {
          totalVentas: 100,
          ventasActivas: 95,
          ventasRecientes: 50
        },
        tableStructure: [{ Field: 'id', Type: 'int' }],
        sampleData: [{ id: 1, fecha: '2025-07-01' }],
        dataCount: 1,
        data: mockServiceData,
        sample: mockServiceData.slice(0, 3)
      });

      consoleSpy.mockRestore();
    });

    it('should handle errors in test', async () => {
      pool.query.mockRejectedValue(new Error('DB Connection Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await salesController.testVentasPorDia(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al probar ventas por día',
        error: 'DB Connection Error'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('debugVentas', () => {
    it('should return debug data successfully', async () => {
      const mockRawData = [
        { id: 1, fecha: '2025-07-01', total: 100, anulada: 0 }
      ];
      pool.query.mockResolvedValue([mockRawData]);

      await salesController.debugVentas(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Datos crudos de ventas',
        count: 1,
        data: mockRawData
      });
    });

    it('should handle errors in debug', async () => {
      pool.query.mockRejectedValue(new Error('Query Error'));

      await salesController.debugVentas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error obteniendo datos debug',
        error: 'Query Error'
      });
    });
  });

  describe('getMetodosPago', () => {
    it('should return payment methods successfully', async () => {
      const mockData = [
        { metodo_pago: 'efectivo', total: 1000 },
        { metodo_pago: 'tarjeta', total: 800 }
      ];
      salesService.getMetodosPago.mockResolvedValue(mockData);

      await salesController.getMetodosPago(req, res);

      expect(salesService.getMetodosPago).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle errors', async () => {
      salesService.getMetodosPago.mockRejectedValue(new Error('Service Error'));

      await salesController.getMetodosPago(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener métodos de pago' });
    });
  });

  describe('getVentaById', () => {
    it('should return sale by id successfully', async () => {
      req.params.id = '1';
      const mockSale = { id: 1, cliente: 'Cliente Test', total: 500 };
      salesService.getSaleById.mockResolvedValue(mockSale);

      await salesController.getVentaById(req, res);

      expect(salesService.getSaleById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockSale);
    });

    it('should handle errors', async () => {
      req.params.id = '999';
      const error = new Error('Sale not found');
      salesService.getSaleById.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await salesController.getVentaById(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error al obtener detalle de venta:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener detalle de venta' });

      consoleSpy.mockRestore();
    });
  });

  describe('createVenta', () => {
    it('should create sale successfully', async () => {
      req.body = {
        productos: [{ id: 1, cantidad: 2 }],
        cliente: 'Cliente Test',
        metodo_pago: 'efectivo'
      };
      req.user = { id: 1 };
      
      salesService.createVenta.mockResolvedValue(123);

      await salesController.createVenta(req, res);

      expect(salesService.createVenta).toHaveBeenCalledWith(req.body, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ventaId: 123 });
    });

    it('should handle errors with custom status', async () => {
      req.body = { productos: [] };
      const error = new Error('Productos requeridos');
      error.status = 400;
      salesService.createVenta.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await salesController.createVenta(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('❌ Error en createVenta:', error);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Productos requeridos' });

      consoleSpy.mockRestore();
    });

    it('should handle errors with default status', async () => {
      req.body = { productos: [] };
      const error = new Error('Unknown error');
      salesService.createVenta.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await salesController.createVenta(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unknown error' });

      consoleSpy.mockRestore();
    });
  });

  describe('anularVenta', () => {
    it('should cancel sale successfully', async () => {
      req.params.id = '1';
      req.body = { motivo: 'Error en venta', user_id: 1 };
      const mockResult = { message: 'Venta anulada correctamente' };
      
      salesService.anularVenta.mockResolvedValue(mockResult);

      await salesController.anularVenta(req, res);

      expect(salesService.anularVenta).toHaveBeenCalledWith('1', 'Error en venta', 1);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      req.params.id = '1';
      req.body = { motivo: 'Test', user_id: 1 };
      const error = new Error('Sale already cancelled');
      error.status = 400;
      
      salesService.anularVenta.mockRejectedValue(error);

      await salesController.anularVenta(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Sale already cancelled' });
    });
  });

  describe('getTopProducts', () => {
    it('should return top products with default limit', async () => {
      const mockProducts = [
        { id: 1, name: 'Producto 1', cantidad_vendida: 50 },
        { id: 2, name: 'Producto 2', cantidad_vendida: 30 }
      ];
      salesService.getTopProducts.mockResolvedValue(mockProducts);

      await salesController.getTopProducts(req, res);

      expect(salesService.getTopProducts).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should return top products with custom limit', async () => {
      req.query.limit = '10';
      const mockProducts = [];
      salesService.getTopProducts.mockResolvedValue(mockProducts);

      await salesController.getTopProducts(req, res);

      expect(salesService.getTopProducts).toHaveBeenCalledWith('10');
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      salesService.getTopProducts.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await salesController.getTopProducts(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('Error al obtener productos más vendidos:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener productos más vendidos' });

      consoleSpy.mockRestore();
    });
  });

  describe('generarComprobante', () => {
    it('should generate receipt successfully', async () => {
      req.params.id = '1';
      const mockComprobante = {
        tipo: 'boleta',
        numero: 'B000001',
        total: 500
      };
      salesService.generarComprobante.mockResolvedValue(mockComprobante);

      await salesController.generarComprobante(req, res);

      expect(salesService.generarComprobante).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockComprobante);
    });

    it('should handle errors', async () => {
      req.params.id = '999';
      const error = new Error('Sale not found');
      salesService.generarComprobante.mockRejectedValue(error);

      await salesController.generarComprobante(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al generar comprobante',
        error: error
      });
    });
  });
});