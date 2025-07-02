const productController = require('../../controllers/productController');
const productService = require('../../services/productService');
const pool = require('../../config/db');

// Mock de dependencias
jest.mock('../../services/productService');
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

describe('Product Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      file: null,
      user: { nombre: 'Test User', correo_electronico: 'test@example.com' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all products successfully', async () => {
      const mockProducts = [
        { id: 1, name: 'Producto 1', price: 100 },
        { id: 2, name: 'Producto 2', price: 200 }
      ];
      
      productService.getAll.mockResolvedValue(mockProducts);

      await productController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
      expect(productService.getAll).toHaveBeenCalled();
    });

    it('should handle errors when getting all products', async () => {
      productService.getAll.mockRejectedValue(new Error('Database error'));

      await productController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Error interno al listar productos' 
      });
    });
  });

  describe('getDestacados', () => {
    it('should return featured products successfully', async () => {
      const mockFeaturedProducts = [
        { id: 1, name: 'Producto Destacado 1', featured: true },
        { id: 2, name: 'Producto Destacado 2', featured: true }
      ];
      
      productService.getDestacados.mockResolvedValue(mockFeaturedProducts);

      await productController.getDestacados(req, res);

      expect(res.json).toHaveBeenCalledWith(mockFeaturedProducts);
      expect(productService.getDestacados).toHaveBeenCalled();
    });

    it('should handle errors when getting featured products', async () => {
      productService.getDestacados.mockRejectedValue(new Error('Database error'));

      await productController.getDestacados(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Error al obtener productos destacados' 
      });
    });
  });

  describe('add', () => {
    beforeEach(() => {
      req.body = {
        name: 'Nuevo Producto',
        description: 'Descripción del producto',
        price: 100,
        purchase_price: 80,
        category: 'Categoría Test',
        marca: 'Marca Test',
        unidad_medida: 'unidad',
        stock: 50,
        stock_min: 10,
        stock_max: 100
      };
    });

    it('should add product successfully without image', async () => {
      const mockProductId = 123;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(productService.insertProduct).toHaveBeenCalledWith({
        ...req.body,
        image: null
      });
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        ['Producto agregado: Nuevo Producto', 'Test User']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: mockProductId,
        name: 'Nuevo Producto'
      });
    });

    it('should add product successfully with image', async () => {
      req.file = { filename: 'test-image.jpg' };
      const mockProductId = 124;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(productService.insertProduct).toHaveBeenCalledWith({
        ...req.body,
        image: '/uploads/test-image.jpg'
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle missing required fields', async () => {
      req.body = { name: 'Producto Incompleto' }; // Faltan campos obligatorios

      await productController.add(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Todos los campos son obligatorios'
      });
      expect(productService.insertProduct).not.toHaveBeenCalled();
    });

    it('should use email when user name is not available', async () => {
      req.user = { correo_electronico: 'test@example.com' }; // Sin nombre
      const mockProductId = 125;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        ['Producto agregado: Nuevo Producto', 'test@example.com']
      );
    });

    it('should use "Desconocido" when user is not available', async () => {
      req.user = null;
      const mockProductId = 126;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        ['Producto agregado: Nuevo Producto', 'Desconocido']
      );
    });

    it('should handle service errors', async () => {
      productService.insertProduct.mockRejectedValue(new Error('Database error'));

      await productController.add(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al agregar producto'
      });
    });

    it('should handle activity log errors gracefully', async () => {
      const mockProductId = 127;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockRejectedValue(new Error('Activity log error'));

      await productController.add(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al agregar producto'
      });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      req.params = { id: '123' };
      req.body = {
        name: 'Producto Actualizado',
        description: 'Nueva descripción',
        price: 150
      };
    });

    it('should update product successfully without image', async () => {
      productService.updateProduct.mockResolvedValue();
      pool.query.mockResolvedValue([{}]);

      await productController.update(req, res);

      expect(productService.updateProduct).toHaveBeenCalledWith('123', req.body);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        ['Producto actualizado: Producto Actualizado', 'Test User']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto actualizado'
      });
    });

    it('should update product successfully with image', async () => {
      req.file = { filename: 'updated-image.jpg' };
      productService.updateProduct.mockResolvedValue();
      pool.query.mockResolvedValue([{}]);

      await productController.update(req, res);

      const expectedData = {
        ...req.body,
        image: '/uploads/updated-image.jpg'
      };

      expect(productService.updateProduct).toHaveBeenCalledWith('123', expectedData);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle update errors', async () => {
      productService.updateProduct.mockRejectedValue(new Error('Update error'));

      await productController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al actualizar producto'
      });
    });

    it('should handle activity log errors during update', async () => {
      productService.updateProduct.mockResolvedValue();
      pool.query.mockRejectedValue(new Error('Activity log error'));

      await productController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al actualizar producto'
      });
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      req.params = { id: '123' };
    });

    it('should soft delete product successfully', async () => {
      productService.softDelete.mockResolvedValue();
      pool.query.mockResolvedValue([{}]);

      await productController.remove(req, res);

      expect(productService.softDelete).toHaveBeenCalledWith('123');
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        ['Producto desactivado: ID 123', 'Test User']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Producto desactivado'
      });
    });

    it('should handle soft delete errors', async () => {
      productService.softDelete.mockRejectedValue(new Error('Delete error'));

      await productController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al desactivar producto'
      });
    });

    it('should handle activity log errors during remove', async () => {
      productService.softDelete.mockResolvedValue();
      pool.query.mockRejectedValue(new Error('Activity log error'));

      await productController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al desactivar producto'
      });
    });
  });

  describe('filterBy', () => {
    beforeEach(() => {
      req.params = { 
        field: 'category',
        value: 'Electronics'
      };
    });

    it('should filter products successfully', async () => {
      const mockFilteredProducts = [
        { id: 1, name: 'Producto 1', category: 'Electronics' },
        { id: 2, name: 'Producto 2', category: 'Electronics' }
      ];
      
      productService.getByFilter.mockResolvedValue(mockFilteredProducts);

      await productController.filterBy(req, res);

      expect(productService.getByFilter).toHaveBeenCalledWith('category', 'Electronics');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFilteredProducts);
    });

    it('should handle filter errors', async () => {
      productService.getByFilter.mockRejectedValue(new Error('Filter error'));

      await productController.filterBy(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al filtrar productos por category'
      });
    });

    it('should handle different filter fields', async () => {
      req.params = { field: 'marca', value: 'Samsung' };
      const mockFilteredProducts = [];
      
      productService.getByFilter.mockResolvedValue(mockFilteredProducts);

      await productController.filterBy(req, res);

      expect(productService.getByFilter).toHaveBeenCalledWith('marca', 'Samsung');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFilteredProducts);
    });

    it('should handle empty filter results', async () => {
      productService.getByFilter.mockResolvedValue([]);

      await productController.filterBy(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined req.user in add method', async () => {
      req.user = undefined;
      req.body = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        purchase_price: 80,
        category: 'Test Category',
        marca: 'Test Brand',
        unidad_medida: 'unit',
        stock: 50,
        stock_min: 10,
        stock_max: 100
      };
      
      const mockProductId = 128;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        ['Producto agregado: Test Product', 'Desconocido']
      );
    });

    it('should handle special characters in product names', async () => {
      req.body = {
        name: 'Producto "Especial" & Test',
        description: 'Descripción con ñ y acentos',
        price: 100,
        purchase_price: 80,
        category: 'Categoría',
        marca: 'Marca',
        unidad_medida: 'unidad',
        stock: 50,
        stock_min: 10,
        stock_max: 100
      };
      
      const mockProductId = 129;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(productService.insertProduct).toHaveBeenCalledWith({
        ...req.body,
        image: null
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle numeric string parameters', async () => {
      req.params = { field: 'price', value: '100' };
      const mockFilteredProducts = [{ id: 1, price: 100 }];
      
      productService.getByFilter.mockResolvedValue(mockFilteredProducts);

      await productController.filterBy(req, res);

      expect(productService.getByFilter).toHaveBeenCalledWith('price', '100');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Request Object Variations', () => {
    it('should handle empty req.body in update', async () => {
      req.params = { id: '123' };
      req.body = {};
      
      productService.updateProduct.mockResolvedValue();
      pool.query.mockResolvedValue([{}]);

      await productController.update(req, res);

      expect(productService.updateProduct).toHaveBeenCalledWith('123', {});
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle missing file property', async () => {
      delete req.file; // Asegurar que req.file es undefined
      req.body = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        purchase_price: 80,
        category: 'Test Category',
        marca: 'Test Brand',
        unidad_medida: 'unit',
        stock: 50,
        stock_min: 10,
        stock_max: 100
      };
      
      const mockProductId = 130;
      productService.insertProduct.mockResolvedValue(mockProductId);
      pool.query.mockResolvedValue([{}]);

      await productController.add(req, res);

      expect(productService.insertProduct).toHaveBeenCalledWith({
        ...req.body,
        image: null
      });
    });
  });
});