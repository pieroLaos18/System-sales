const productService = require('../../services/productService');
const pool = require('../../config/db');

// Mock de la base de datos
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all active products with low_stock indicator', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Producto 1',
          stock: 5,
          stock_min: 10,
          price: 100,
          activo: 1
        },
        {
          id: 2,
          name: 'Producto 2',
          stock: 20,
          stock_min: 10,
          price: 200,
          activo: 1
        },
        {
          id: 3,
          name: 'Producto 3',
          stock: 10,
          stock_min: 10,
          price: 150,
          activo: 1
        }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getAll();

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE activo = 1'
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        ...mockProducts[0],
        low_stock: true // 5 <= 10
      });
      expect(result[1]).toEqual({
        ...mockProducts[1],
        low_stock: false // 20 > 10
      });
      expect(result[2]).toEqual({
        ...mockProducts[2],
        low_stock: true // 10 <= 10
      });
    });

    it('should return empty array when no products found', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await productService.getAll();

      expect(result).toEqual([]);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE activo = 1'
      );
    });

    it('should handle string numbers in stock calculations', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Producto Test',
          stock: '15', // String number
          stock_min: '10', // String number
          price: 100
        }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getAll();

      expect(result[0].low_stock).toBe(false); // Number(15) > Number(10)
    });

    it('should handle zero stock correctly', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Producto Sin Stock',
          stock: 0,
          stock_min: 5,
          price: 100
        }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getAll();

      expect(result[0].low_stock).toBe(true); // 0 <= 5
    });

    it('should throw error when database query fails', async () => {
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(productService.getAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getDestacados', () => {
    it('should return top 5 best selling products', async () => {
      const mockDestacados = [
        { id: 1, name: 'Producto Más Vendido', vendidos: 100, stock: 20 },
        { id: 2, name: 'Segundo Más Vendido', vendidos: 80, stock: 15 },
        { id: 3, name: 'Tercer Más Vendido', vendidos: 60, stock: 10 },
        { id: 4, name: 'Cuarto Más Vendido', vendidos: 40, stock: 5 },
        { id: 5, name: 'Quinto Más Vendido', vendidos: 20, stock: 8 }
      ];

      pool.query.mockResolvedValue([mockDestacados]);

      const result = await productService.getDestacados();

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT p.id, p.name, SUM(dv.cantidad) as vendidos'));
      expect(result).toEqual(mockDestacados);
      expect(result).toHaveLength(5);
    });

    it('should return fewer than 5 products if database has less', async () => {
      const mockDestacados = [
        { id: 1, name: 'Único Producto', vendidos: 50, stock: 10 }
      ];

      pool.query.mockResolvedValue([mockDestacados]);

      const result = await productService.getDestacados();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Único Producto');
    });

    it('should return empty array when no sales found', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await productService.getDestacados();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await expect(productService.getDestacados()).rejects.toThrow('Database error');
    });
  });

  describe('insertProduct', () => {
    it('should insert product and return insertId', async () => {
      const mockProductData = {
        name: 'Nuevo Producto',
        description: 'Descripción del producto',
        price: 100,
        purchase_price: 80,
        category: 'Electrónicos',
        marca: 'Samsung',
        unidad_medida: 'unidad',
        stock: 50,
        stock_min: 10,
        stock_max: 100,
        image: '/uploads/imagen.jpg'
      };

      const mockResult = { insertId: 123 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await productService.insertProduct(mockProductData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        Object.values(mockProductData)
      );
      expect(result).toBe(123);
    });

    it('should handle product data without image', async () => {
      const mockProductData = {
        name: 'Producto Sin Imagen',
        description: 'Descripción',
        price: 50,
        purchase_price: 40,
        category: 'Categoría',
        marca: 'Marca',
        unidad_medida: 'kg',
        stock: 25,
        stock_min: 5,
        stock_max: 50,
        image: null
      };

      const mockResult = { insertId: 124 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await productService.insertProduct(mockProductData);

      expect(result).toBe(124);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([null]) // Debe incluir null para la imagen
      );
    });

    it('should handle special characters in product data', async () => {
      const mockProductData = {
        name: 'Producto "Especial" & Test',
        description: 'Descripción con ñ y acentos',
        price: 100,
        purchase_price: 80,
        category: 'Categoría Especial',
        marca: 'Marca & Cía',
        unidad_medida: 'unidad',
        stock: 30,
        stock_min: 5,
        stock_max: 60,
        image: null
      };

      const mockResult = { insertId: 125 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await productService.insertProduct(mockProductData);

      expect(result).toBe(125);
    });

    it('should throw error when insert fails', async () => {
      const mockProductData = {
        name: 'Producto Error',
        description: 'Test',
        price: 100,
        purchase_price: 80,
        category: 'Test',
        marca: 'Test',
        unidad_medida: 'unidad',
        stock: 10,
        stock_min: 1,
        stock_max: 20,
        image: null
      };

      pool.query.mockRejectedValue(new Error('Insert failed'));

      await expect(productService.insertProduct(mockProductData))
        .rejects.toThrow('Insert failed');
    });
  });

  describe('updateProduct', () => {
    it('should update product with all fields', async () => {
      const productId = 123;
      const updateData = {
        name: 'Producto Actualizado',
        price: 150,
        description: 'Nueva descripción',
        stock: 30
      };

      pool.query.mockResolvedValue([{}]);

      await productService.updateProduct(productId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET name = ?, price = ?, description = ?, stock = ? WHERE id = ?',
        ['Producto Actualizado', 150, 'Nueva descripción', 30, 123]
      );
    });

    it('should update product with single field', async () => {
      const productId = 456;
      const updateData = { price: 200 };

      pool.query.mockResolvedValue([{}]);

      await productService.updateProduct(productId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET price = ? WHERE id = ?',
        [200, 456]
      );
    });

    it('should handle empty update data', async () => {
      const productId = 789;
      const updateData = {};

      pool.query.mockResolvedValue([{}]);

      await productService.updateProduct(productId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET  WHERE id = ?',
        [789]
      );
    });

    it('should update product with image', async () => {
      const productId = 101;
      const updateData = {
        name: 'Producto con Nueva Imagen',
        image: '/uploads/nueva-imagen.jpg'
      };

      pool.query.mockResolvedValue([{}]);

      await productService.updateProduct(productId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET name = ?, image = ? WHERE id = ?',
        ['Producto con Nueva Imagen', '/uploads/nueva-imagen.jpg', 101]
      );
    });

    it('should throw error when update fails', async () => {
      const productId = 999;
      const updateData = { name: 'Test' };

      pool.query.mockRejectedValue(new Error('Update failed'));

      await expect(productService.updateProduct(productId, updateData))
        .rejects.toThrow('Update failed');
    });
  });

  describe('softDelete', () => {
    it('should set product as inactive', async () => {
      const productId = 123;
      
      pool.query.mockResolvedValue([{}]);

      await productService.softDelete(productId);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET activo = 0 WHERE id = ?',
        [123]
      );
    });

    it('should handle string product id', async () => {
      const productId = '456';
      
      pool.query.mockResolvedValue([{}]);

      await productService.softDelete(productId);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET activo = 0 WHERE id = ?',
        ['456']
      );
    });

    it('should throw error when soft delete fails', async () => {
      const productId = 789;
      
      pool.query.mockRejectedValue(new Error('Soft delete failed'));

      await expect(productService.softDelete(productId))
        .rejects.toThrow('Soft delete failed');
    });
  });

  describe('getByFilter', () => {
    it('should filter products by category', async () => {
      const mockProducts = [
        { id: 1, name: 'Laptop', category: 'Electrónicos', activo: 1 },
        { id: 2, name: 'Mouse', category: 'Electrónicos', activo: 1 }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getByFilter('category', 'Electrónicos');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE category = ? AND activo = 1',
        ['Electrónicos']
      );
      expect(result).toEqual(mockProducts);
    });

    it('should filter products by marca', async () => {
      const mockProducts = [
        { id: 3, name: 'Galaxy S21', marca: 'Samsung', activo: 1 }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getByFilter('marca', 'Samsung');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE marca = ? AND activo = 1',
        ['Samsung']
      );
      expect(result).toEqual(mockProducts);
    });

    it('should filter products by price', async () => {
      const mockProducts = [
        { id: 4, name: 'Producto Barato', price: 100, activo: 1 }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getByFilter('price', 100);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE price = ? AND activo = 1',
        [100]
      );
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array when no products match filter', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await productService.getByFilter('category', 'NoExiste');

      expect(result).toEqual([]);
    });

    it('should handle special characters in filter values', async () => {
      const mockProducts = [];
      pool.query.mockResolvedValue([mockProducts]);

      await productService.getByFilter('name', 'Producto "Especial" & Test');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE name = ? AND activo = 1',
        ['Producto "Especial" & Test']
      );
    });

    it('should throw error when filter query fails', async () => {
      pool.query.mockRejectedValue(new Error('Filter query failed'));

      await expect(productService.getByFilter('category', 'Test'))
        .rejects.toThrow('Filter query failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values in product data', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Producto con Nulls',
          stock: null,
          stock_min: null,
          price: 100,
          description: null
        }
      ];

      pool.query.mockResolvedValue([mockProducts]);

      const result = await productService.getAll();

      // Number(null) = 0, Number(null) = 0, entonces 0 <= 0 es true
      expect(result[0].low_stock).toBe(true);
    });

    it('should handle undefined values in update', async () => {
      const productId = 123;
      const updateData = {
        name: 'Test',
        description: undefined,
        price: 100
      };

      pool.query.mockResolvedValue([{}]);

      await productService.updateProduct(productId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
        ['Test', undefined, 100, 123]
      );
    });

    it('should handle very large numbers', async () => {
      const mockProductData = {
        name: 'Producto Caro',
        description: 'Muy caro',
        price: 999999.99,
        purchase_price: 888888.88,
        category: 'Lujo',
        marca: 'Premium',
        unidad_medida: 'unidad',
        stock: 1000000,
        stock_min: 100000,
        stock_max: 5000000,
        image: null
      };

      const mockResult = { insertId: 999 };
      pool.query.mockResolvedValue([mockResult]);

      const result = await productService.insertProduct(mockProductData);

      expect(result).toBe(999);
    });
  });
});