const request = require('supertest');
const app = require('../app'); // tu archivo principal de Express
const pool = require('../config/db');

// Mockear middleware y controller
jest.mock('../middleware/authenticate', () => jest.fn((req, res, next) => next()));
jest.mock('../middleware/upload', () => ({
  single: jest.fn(() => (req, res, next) => next())
}));
jest.mock('../controllers/productController', () => ({
  getAll: jest.fn((req, res) => res.status(200).json([{ id: 1, name: 'Producto A' }])),
  getDestacados: jest.fn((req, res) => res.status(200).json([{ id: 2, name: 'Destacado' }])),
  filterBy: jest.fn((req, res) => res.status(200).json([{ id: 3, name: 'Filtrado' }])),
  add: jest.fn((req, res) => res.status(201).json({ message: 'Producto creado' })),
  update: jest.fn((req, res) => res.status(200).json({ message: 'Producto actualizado' })),
  remove: jest.fn((req, res) => res.status(200).json({ message: 'Producto eliminado' }))
}));

afterAll(async () => {
  await pool.end();
});

describe('🔎 Rutas de productos', () => {

  test('GET /api/products → debería retornar todos los productos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([{ id: 1, name: 'Producto A' }]));
  });

  test('GET /api/products/destacados → debería retornar productos destacados', async () => {
    const res = await request(app).get('/api/products/destacados');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].name).toBe('Destacado');
  });

  test('GET /api/products/filter/:field/:value → debería filtrar productos', async () => {
    const res = await request(app).get('/api/products/filter/categoria/Ropa');
    expect(res.statusCode).toBe(200);
    expect(res.body[0].name).toBe('Filtrado');
  });

  test('POST /api/products → debería agregar un producto (autenticado)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer fake-token')
      .field('name', 'Nuevo producto')
      .attach('image', Buffer.from('fake-image'), 'image.jpg');
    
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Producto creado');
  });

  test('PUT /api/products/:id → debería actualizar un producto (autenticado)', async () => {
    const res = await request(app)
      .put('/api/products/1')
      .set('Authorization', 'Bearer fake-token')
      .field('name', 'Producto actualizado')
      .attach('image', Buffer.from('fake-image'), 'image.jpg');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Producto actualizado');
  });

  test('DELETE /api/products/:id → debería eliminar un producto (autenticado)', async () => {
    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', 'Bearer fake-token');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Producto eliminado');
  });
});
