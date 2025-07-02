const salesService = require('../../services/salesService');
const pool = require('../../config/db');

// Mock de la base de datos
jest.mock('../../config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn()
}));

describe('Sales Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSalesWithProducts', () => {
    it('should return empty array when no sales found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const result = await salesService.getAllSalesWithProducts();

      expect(result).toEqual([]);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM ventas ORDER BY fecha DESC');
    });

    it('should return sales with products', async () => {
      const mockVentas = [
        { id: 1, cliente: 'Cliente 1', total: 100 },
        { id: 2, cliente: 'Cliente 2', total: 200 }
      ];
      const mockProductos = [
        { venta_id: 1, id: 1, name: 'Producto 1', cantidad: 2, precio: 50 },
        { venta_id: 2, id: 2, name: 'Producto 2', cantidad: 1, precio: 200 }
      ];

      pool.query
        .mockResolvedValueOnce([mockVentas])
        .mockResolvedValueOnce([mockProductos]);

      const result = await salesService.getAllSalesWithProducts();

      expect(result).toHaveLength(2);
      expect(result[0].productos).toHaveLength(1);
      expect(result[1].productos).toHaveLength(1);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it('should return sales without products query when no sales', async () => {
      const mockVentas = [];
      pool.query.mockResolvedValueOnce([mockVentas]);

      const result = await salesService.getAllSalesWithProducts();

      expect(result).toEqual([]);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSalesResumen', () => {
    it('should return sales summary for today and month', async () => {
      const mockHoy = [{ hoy: 500 }];
      const mockMes = [{ mes: 15000 }];

      pool.query
        .mockResolvedValueOnce([mockHoy])
        .mockResolvedValueOnce([mockMes]);

      const result = await salesService.getSalesResumen();

      expect(result).toEqual({ hoy: 500, mes: 15000 });
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('getVentasPorDia', () => {
    it('should return sales by day with data', async () => {
      const mockStats = [{
        total: 10,
        fecha_min: '2025-06-01',
        fecha_max: '2025-07-01',
        suma_total: 1000
      }];
      const mockRecientes = [
        { fecha_formateada: '2025-07-01', fecha: '2025-07-01', total: 500 }
      ];
      const mockData = [
        { fecha: '2025-07-01', dia: 'Lunes', total: 500, cantidad_ventas: 2 }
      ];

      pool.query
        .mockResolvedValueOnce([mockStats])
        .mockResolvedValueOnce([mockRecientes])
        .mockResolvedValueOnce([mockData]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await salesService.getVentasPorDia();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        dia: 'Lunes',
        fecha: '2025-07-01',
        total: 500,
        cantidad_ventas: 2
      });

      consoleSpy.mockRestore();
    });

    it('should return last sales when no data in range', async () => {
      const mockStats = [{ total: 5, fecha_min: '2025-06-01', fecha_max: '2025-06-15', suma_total: 500 }];
      const mockRecientes = [];
      const mockLastSales = [
        { fecha: '2025-06-15', dia: 'Sábado', total: 300, cantidad_ventas: 1 }
      ];

      pool.query
        .mockResolvedValueOnce([mockStats])
        .mockResolvedValueOnce([mockRecientes])
        .mockResolvedValueOnce([[]]) // Array vacío pero válido
        .mockResolvedValueOnce([mockLastSales]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await salesService.getVentasPorDia();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        dia: 'Sábado',
        fecha: '2025-06-15',
        total: 300,
        cantidad_ventas: 1
      });

      consoleSpy.mockRestore();
    });

    it('should handle errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(salesService.getVentasPorDia()).rejects.toThrow('Database error');
      expect(consoleSpy).toHaveBeenCalledWith('❌ Error en getSalesByDay:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getVentasPorDiaAnterior', () => {
    it('should return previous week sales', async () => {
      const mockData = [
        { fecha: '2025-06-24', dia: 'Lunes', total: 200 }
      ];
      pool.query.mockResolvedValue([mockData]);

      const result = await salesService.getVentasPorDiaAnterior();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        dia: 'Lunes',
        fecha: '2025-06-24',
        total: 200
      });
    });
  });

  describe('getMetodosPago', () => {
    it('should return payment methods with totals', async () => {
      const mockData = [
        { metodo_pago: 'efectivo', total: 1000 },
        { metodo_pago: 'tarjeta', total: 800 }
      ];
      pool.query.mockResolvedValue([mockData]);

      const result = await salesService.getMetodosPago();

      expect(result).toEqual(mockData);
    });
  });

  describe('getSaleById', () => {
    it('should return sale with products by id', async () => {
      const mockVenta = [{ id: 1, cliente: 'Cliente Test', total: 500 }];
      const mockProductos = [
        { id: 1, name: 'Producto 1', cantidad: 2, precio_unitario: 250 }
      ];

      pool.query
        .mockResolvedValueOnce([mockVenta])
        .mockResolvedValueOnce([mockProductos]);

      const result = await salesService.getSaleById(1);

      expect(result.id).toBe(1);
      expect(result.productos).toHaveLength(1);
      expect(result.productos[0].precio).toBe(250);
    });
  });

  describe('createVenta', () => {
    let mockConnection;

    beforeEach(() => {
      mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        query: jest.fn()
      };
      pool.getConnection.mockResolvedValue(mockConnection);
    });

    it('should create sale successfully', async () => {
      const mockProductos = [{ id: 1, cantidad: 2 }];
      const mockProductosDB = [{ id: 1, price: 100 }];
      const mockStockCheck = { stock: 10 };

      mockConnection.query
        .mockResolvedValueOnce([mockProductosDB]) // Get products with prices
        .mockResolvedValueOnce([{ insertId: 123 }]) // Insert sale
        .mockResolvedValueOnce([[mockStockCheck]]) // Stock check
        .mockResolvedValueOnce([{}]) // Insert detail
        .mockResolvedValueOnce([{}]) // Update stock
        .mockResolvedValueOnce([{}]); // Insert activity

      const result = await salesService.createVenta({
        productos: mockProductos,
        cliente: 'Cliente Test',
        user_id: 1,
        metodo_pago: 'efectivo',
        usuario: 'Test User'
      });

      expect(result).toBe(123);
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should rollback on insufficient stock', async () => {
      const mockProductos = [{ id: 1, cantidad: 5 }];
      const mockProductosDB = [{ id: 1, price: 100 }];
      const mockStockCheck = { stock: 2 };

      mockConnection.query
        .mockResolvedValueOnce([mockProductosDB])
        .mockResolvedValueOnce([{ insertId: 123 }])
        .mockResolvedValueOnce([[mockStockCheck]]); // Mock debe devolver array con el objeto

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(salesService.createVenta({
        productos: mockProductos,
        cliente: 'Cliente Test',
        user_id: 1,
        metodo_pago: 'efectivo'
      })).rejects.toThrow('Error al registrar venta: Stock insuficiente para el producto ID 1');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should rollback on product not found', async () => {
      const mockProductos = [{ id: 999, cantidad: 1 }];
      
      mockConnection.query.mockResolvedValueOnce([[]]);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(salesService.createVenta({
        productos: mockProductos,
        cliente: 'Cliente Test',
        user_id: 1,
        metodo_pago: 'efectivo'
      })).rejects.toThrow('Error al registrar venta: Producto con ID 999 no encontrado.');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('anularVenta', () => {
    let mockConnection;

    beforeEach(() => {
      mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        query: jest.fn()
      };
      pool.getConnection.mockResolvedValue(mockConnection);
    });

    it('should cancel sale successfully', async () => {
      const mockVentaCheck = [{ anulada: 0 }];
      const mockProductos = [{ producto_id: 1, cantidad: 2 }];
      const mockUsuario = [{ nombre: 'Test User' }];

      mockConnection.query
        .mockResolvedValueOnce([mockVentaCheck]) // Check sale exists
        .mockResolvedValueOnce([{}]) // Update sale
        .mockResolvedValueOnce([mockProductos]) // Get products
        .mockResolvedValueOnce([{}]) // Update stock
        .mockResolvedValueOnce([mockUsuario]) // Get user name
        .mockResolvedValueOnce([{}]); // Insert activity

      const result = await salesService.anularVenta(1, 'Error en venta', 1);

      expect(result.message).toBe('Venta anulada correctamente y stock recuperado');
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should throw error if sale not found', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);

      await expect(salesService.anularVenta(999, 'Motivo', 1))
        .rejects.toThrow('Venta no encontrada');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it('should throw error if sale already cancelled', async () => {
      const mockVentaCheck = [{ anulada: 1 }];
      mockConnection.query.mockResolvedValueOnce([mockVentaCheck]);

      await expect(salesService.anularVenta(1, 'Motivo', 1))
        .rejects.toThrow('La venta ya está anulada');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('getTopProducts', () => {
    it('should return top products with default limit', async () => {
      const mockProducts = [
        { id: 1, name: 'Producto 1', cantidad_vendida: 50, total_ingresos: 5000 },
        { id: 2, name: 'Producto 2', cantidad_vendida: 30, total_ingresos: 3000 }
      ];
      pool.query.mockResolvedValue([mockProducts]);

      const result = await salesService.getTopProducts();

      expect(result).toEqual(mockProducts);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [5]);
    });

    it('should return top products with custom limit', async () => {
      const mockProducts = [];
      pool.query.mockResolvedValue([mockProducts]);

      const result = await salesService.getTopProducts(10);

      expect(result).toEqual(mockProducts);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [10]);
    });
  });

  describe('generarComprobante', () => {
    it('should generate comprobante successfully', async () => {
      const mockVenta = [{
        id: 1,
        tipo_comprobante: 'boleta',
        numero_comprobante: 'B000001',
        fecha: '2025-07-01',
        cliente: 'Cliente Test',
        metodo_pago: 'efectivo',
        subtotal: 100,
        impuestos: 18,
        total: 118
      }];
      const mockDetalle = [
        { producto_id: 1, cantidad: 2, precio_unitario: 50 }
      ];

      pool.query
        .mockResolvedValueOnce([mockVenta])
        .mockResolvedValueOnce([mockDetalle]);

      const result = await salesService.generarComprobante(1);

      expect(result.tipo).toBe('boleta');
      expect(result.numero).toBe('B000001');
      expect(result.total).toBe(118);
      expect(result.productos).toEqual(mockDetalle);
    });

    it('should generate comprobante with default values', async () => {
      const mockVenta = [{
        id: 1,
        fecha: '2025-07-01',
        cliente: 'Cliente Test',
        metodo_pago: 'efectivo',
        subtotal: 100,
        total: 118
      }];
      const mockDetalle = [];

      pool.query
        .mockResolvedValueOnce([mockVenta])
        .mockResolvedValueOnce([mockDetalle]);

      const result = await salesService.generarComprobante(1);

      expect(result.tipo).toBe('boleta');
      expect(result.numero).toBe('B000001');
    });

    it('should throw error if sale not found', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      await expect(salesService.generarComprobante(999))
        .rejects.toThrow('Venta no encontrada');
    });
  });
});