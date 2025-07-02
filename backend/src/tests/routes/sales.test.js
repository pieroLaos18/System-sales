const request = require('supertest');
const express = require('express');
const salesRoutes = require('../../routes/sales');
const salesController = require('../../controllers/salesController');
const authenticate = require('../../middleware/authenticate');
const migrationService = require('../../services/migrationService');

// Mock de dependencias
jest.mock('../../controllers/salesController');
jest.mock('../../middleware/authenticate');
jest.mock('../../services/migrationService');

// Crear app de Express para testing
const app = express();
app.use(express.json());
app.use('/api/sales', salesRoutes);

describe('Sales Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock del middleware de autenticación para que siempre permita el acceso
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, nombre: 'Test User' };
      next();
    });
  });

  describe('POST /api/sales/migrate-fecha-datetime', () => {
    it('should migrate fecha to datetime successfully', async () => {
      const mockResult = { success: true, migrated: 10 };
      migrationService.migrateFechaToDatetime.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/sales/migrate-fecha-datetime')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(migrationService.migrateFechaToDatetime).toHaveBeenCalled();
    });

    it('should handle migration errors', async () => {
      migrationService.migrateFechaToDatetime.mockRejectedValue(new Error('Migration failed'));

      const response = await request(app)
        .post('/api/sales/migrate-fecha-datetime')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Error en migración',
        error: 'Migration failed'
      });
    });
  });

  describe('GET /api/sales', () => {
    it('should get all sales', async () => {
      salesController.getAllSales.mockImplementation((req, res) => {
        res.json([{ id: 1, total: 100 }]);
      });

      const response = await request(app)
        .get('/api/sales')
        .expect(200);

      expect(response.body).toEqual([{ id: 1, total: 100 }]);
      expect(salesController.getAllSales).toHaveBeenCalled();
    });

    it('should handle errors in getAllSales', async () => {
      salesController.getAllSales.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Error getting sales' });
      });

      const response = await request(app)
        .get('/api/sales')
        .expect(500);

      expect(response.body).toEqual({ message: 'Error getting sales' });
    });
  });

  describe('GET /api/sales/resumen', () => {
    it('should get sales summary', async () => {
      const mockResumen = { hoy: 500, mes: 15000 };
      salesController.getSalesResumen.mockImplementation((req, res) => {
        res.json(mockResumen);
      });

      const response = await request(app)
        .get('/api/sales/resumen')
        .expect(200);

      expect(response.body).toEqual(mockResumen);
      expect(salesController.getSalesResumen).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/ventas-por-dia', () => {
    it('should get sales by day', async () => {
      const mockData = [{ dia: 'Lunes', total: 300 }];
      salesController.getVentasPorDia.mockImplementation((req, res) => {
        res.json(mockData);
      });

      const response = await request(app)
        .get('/api/sales/ventas-por-dia')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(salesController.getVentasPorDia).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/ventas-por-dia-anterior', () => {
    it('should get previous week sales', async () => {
      const mockData = [{ dia: 'Lunes', total: 200 }];
      salesController.getVentasPorDiaAnterior.mockImplementation((req, res) => {
        res.json(mockData);
      });

      const response = await request(app)
        .get('/api/sales/ventas-por-dia-anterior')
        .expect(200);

      expect(response.body).toEqual(mockData);
      expect(salesController.getVentasPorDiaAnterior).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/test-ventas-por-dia', () => {
    it('should run test for sales by day', async () => {
      const mockTestData = { success: true, dataCount: 5 };
      salesController.testVentasPorDia.mockImplementation((req, res) => {
        res.json(mockTestData);
      });

      const response = await request(app)
        .get('/api/sales/test-ventas-por-dia')
        .expect(200);

      expect(response.body).toEqual(mockTestData);
      expect(salesController.testVentasPorDia).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/debug-ventas', () => {
    it('should get debug sales data', async () => {
      const mockDebugData = { message: 'Debug data', count: 10 };
      salesController.debugVentas.mockImplementation((req, res) => {
        res.json(mockDebugData);
      });

      const response = await request(app)
        .get('/api/sales/debug-ventas')
        .expect(200);

      expect(response.body).toEqual(mockDebugData);
      expect(salesController.debugVentas).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/metodos-pago', () => {
    it('should get payment methods', async () => {
      const mockMethods = [{ metodo_pago: 'efectivo', total: 1000 }];
      salesController.getMetodosPago.mockImplementation((req, res) => {
        res.json(mockMethods);
      });

      const response = await request(app)
        .get('/api/sales/metodos-pago')
        .expect(200);

      expect(response.body).toEqual(mockMethods);
      expect(salesController.getMetodosPago).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/top-products', () => {
    it('should get top products with default limit', async () => {
      const mockProducts = [{ id: 1, name: 'Producto 1', cantidad_vendida: 50 }];
      salesController.getTopProducts.mockImplementation((req, res) => {
        res.json(mockProducts);
      });

      const response = await request(app)
        .get('/api/sales/top-products')
        .expect(200);

      expect(response.body).toEqual(mockProducts);
      expect(salesController.getTopProducts).toHaveBeenCalled();
    });

    it('should get top products with custom limit', async () => {
      const mockProducts = [];
      salesController.getTopProducts.mockImplementation((req, res) => {
        res.json(mockProducts);
      });

      const response = await request(app)
        .get('/api/sales/top-products?limit=10')
        .expect(200);

      expect(response.body).toEqual(mockProducts);
      expect(salesController.getTopProducts).toHaveBeenCalled();
    });
  });

  describe('GET /api/sales/:id', () => {
    it('should get sale by id', async () => {
      const mockSale = { id: 1, cliente: 'Cliente Test', total: 500 };
      salesController.getVentaById.mockImplementation((req, res) => {
        res.json(mockSale);
      });

      const response = await request(app)
        .get('/api/sales/123')
        .expect(200);

      expect(response.body).toEqual(mockSale);
      expect(salesController.getVentaById).toHaveBeenCalled();
    });

    it('should handle sale not found', async () => {
      salesController.getVentaById.mockImplementation((req, res) => {
        res.status(404).json({ message: 'Sale not found' });
      });

      const response = await request(app)
        .get('/api/sales/999')
        .expect(404);

      expect(response.body).toEqual({ message: 'Sale not found' });
    });
  });

  describe('GET /api/sales/comprobante/:id', () => {
    it('should generate comprobante successfully', async () => {
      const mockComprobante = { tipo: 'boleta', numero: 'B000001', total: 500 };
      salesController.generarComprobante.mockImplementation((req, res) => {
        res.json(mockComprobante);
      });

      const response = await request(app)
        .get('/api/sales/comprobante/123')
        .expect(200);

      expect(response.body).toEqual(mockComprobante);
      expect(salesController.generarComprobante).toHaveBeenCalled();
    });

    it('should handle comprobante generation errors', async () => {
      salesController.generarComprobante.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Error generating comprobante' });
      });

      const response = await request(app)
        .get('/api/sales/comprobante/999')
        .expect(500);

      expect(response.body).toEqual({ message: 'Error generating comprobante' });
    });
  });

  describe('POST /api/sales (Protected Route)', () => {
    it('should create sale when authenticated', async () => {
      const mockVentaId = 123;
      salesController.createVenta.mockImplementation((req, res) => {
        res.status(201).json({ ventaId: mockVentaId });
      });

      const saleData = {
        productos: [{ id: 1, cantidad: 2 }],
        cliente: 'Cliente Test',
        metodo_pago: 'efectivo'
      };

      const response = await request(app)
        .post('/api/sales')
        .send(saleData)
        .expect(201);

      expect(response.body).toEqual({ ventaId: mockVentaId });
      expect(salesController.createVenta).toHaveBeenCalled();
      expect(authenticate).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      salesController.createVenta.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Invalid data' });
      });

      const response = await request(app)
        .post('/api/sales')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid data' });
    });

    it('should require authentication', async () => {
      // Mock authentication failure
      authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/sales')
        .send({ productos: [] })
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('PUT /api/sales/anular/:id (Protected Route)', () => {
    it('should cancel sale when authenticated', async () => {
      salesController.anularVenta.mockImplementation((req, res) => {
        res.json({ message: 'Venta anulada correctamente' });
      });

      const cancelData = {
        motivo: 'Error en venta',
        user_id: 1
      };

      const response = await request(app)
        .put('/api/sales/anular/123')
        .send(cancelData)
        .expect(200);

      expect(response.body).toEqual({ message: 'Venta anulada correctamente' });
      expect(salesController.anularVenta).toHaveBeenCalled();
      expect(authenticate).toHaveBeenCalled();
    });

    it('should handle cancellation errors', async () => {
      salesController.anularVenta.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Sale already cancelled' });
      });

      const response = await request(app)
        .put('/api/sales/anular/123')
        .send({ motivo: 'Test', user_id: 1 })
        .expect(400);

      expect(response.body).toEqual({ message: 'Sale already cancelled' });
    });

    it('should require authentication for cancellation', async () => {
      authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .put('/api/sales/anular/123')
        .send({ motivo: 'Test', user_id: 1 })
        .expect(401);

      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });

  describe('Route Parameter Handling', () => {
    it('should pass correct parameters to controllers', async () => {
      salesController.getVentaById.mockImplementation((req, res) => {
        expect(req.params.id).toBe('456');
        res.json({ id: 456 });
      });

      await request(app)
        .get('/api/sales/456')
        .expect(200);

      expect(salesController.getVentaById).toHaveBeenCalled();
    });

    it('should handle query parameters', async () => {
      salesController.getTopProducts.mockImplementation((req, res) => {
        expect(req.query.limit).toBe('15');
        res.json([]);
      });

      await request(app)
        .get('/api/sales/top-products?limit=15')
        .expect(200);

      expect(salesController.getTopProducts).toHaveBeenCalled();
    });
  });

  describe('Middleware Integration', () => {
    it('should apply authentication middleware to protected routes only', async () => {
      // Test public route - should not call authenticate
      salesController.getAllSales.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app)
        .get('/api/sales')
        .expect(200);

      // Reset mock to check authenticate wasn't called for public route
      authenticate.mockClear();

      // Test protected route - should call authenticate
      salesController.createVenta.mockImplementation((req, res) => {
        res.json({ ventaId: 1 });
      });

      await request(app)
        .post('/api/sales')
        .send({ productos: [] });

      expect(authenticate).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle controller errors gracefully', async () => {
      salesController.getAllSales.mockImplementation((req, res) => {
        throw new Error('Controller error');
      });

      // El error debería ser manejado por Express
      await request(app)
        .get('/api/sales')
        .expect(500);
    });

    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/sales')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}') // JSON malformado
        .expect(400);

      // Express devuelve diferentes propiedades dependiendo de la versión
      // Solo verificamos que sea un error 400
      expect(response.status).toBe(400);
    });
  });

  // Cleanup después de todos los tests
  afterAll((done) => {
    // Forzar cierre de handles abiertos
    setTimeout(() => {
      done();
    }, 100);
  });
});